const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeInMemoryStore, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const { t } = require('../services/languageService');
const commandHandler = require('./commandHandler');
const Group = require('../models/Group');
const User = require('../models/User');

const SESSION_DIR = path.join(__dirname, '../../session');

class WhatsAppBot {
  constructor() { this.sock = null; this.store = null; this.isConnected = false; this.reconnectAttempts = 0; this.maxReconnectAttempts = 10; this.pairingCode = null; this.qrCode = null; }
  async start() {
    try {
      if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
      this.store = makeInMemoryStore({ logger: pino({ level: 'silent' }) });
      const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
      const { version, isLatest } = await fetchLatestBaileysVersion();
      const usePairingCode = process.env.USE_PAIRING_CODE === 'true';
      const pairingPhoneNumber = process.env.PAIRING_PHONE_NUMBER || '';
      // Check if already registered — skip pairing code if so
      const isAlreadyRegistered = state.creds && state.creds.registered;
      
      const sockOptions = {
        version,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: 'silent' }),
        browser: ['Victory Predict', 'Chrome', '1.0.0'],
        getMessage: async (key) => {
          if (this.store) { const msg = await this.store.loadMessage(key.remoteJid, key.id); return msg ? msg.message : undefined; }
          return undefined;
        },
        markOnlineOnConnect: true,
        syncFullHistory: false
      };
      
      this.sock = makeWASocket(sockOptions);
      this.store.bind(this.sock.ev);
      
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        // QR Code mode (default)
        if (qr && !usePairingCode) {
          this.qrCode = qr;
          logger.info('📱 Scan QR Code to connect');
          try { require('qrcode-terminal').generate(qr, { small: true }); } catch (e) {}
        }
        
        // Pairing Code mode — only request if NOT already registered
        if (usePairingCode && pairingPhoneNumber && !isAlreadyRegistered && !this.pairingCode) {
          // Request pairing code when connecting for the first time
          if (connection === 'connecting' || connection === 'open') {
            // Only request once
            this.pairingCode = 'requesting...';
            logger.info('🔑 Requesting pairing code for ' + pairingPhoneNumber);
            try {
              const code = await this.sock.requestPairingCode(pairingPhoneNumber);
              this.pairingCode = code;
              logger.info('═══════════════════════════════════');
              logger.info('✅ PAIRING CODE: ' + code);
              logger.info('📲 Enter this code on your WhatsApp:');
              logger.info('   Settings > Linked Devices > Link with Phone Number');
              logger.info('═══════════════════════════════════');
              const pairingFilePath = path.join(SESSION_DIR, 'pairing-code.txt');
              fs.writeFileSync(pairingFilePath, 'Pairing Code: ' + code + '\nPhone: ' + pairingPhoneNumber + '\nGenerated: ' + new Date().toISOString() + '\nExpires in: ~60 seconds');
            } catch (err) {
              this.pairingCode = null;
              logger.error('❌ Pairing code error: ' + err.message);
              logger.info('💡 Falling back to QR code. Scan the QR code or restart the bot.');
            }
          }
        }
        
        if (connection === 'open') {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          if (this.pairingCode === 'requesting...') this.pairingCode = null;
          this.qrCode = null;
          logger.info('✅ WhatsApp Bot Connected!');
          await this.onConnected();
        }
        
        if (connection === 'close') {
          this.isConnected = false;
          const shouldReconnect = this.handleDisconnect(lastDisconnect);
          if (shouldReconnect) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            logger.info('🔄 Reconnecting in ' + (delay / 1000) + 's (attempt ' + this.reconnectAttempts + ')');
            setTimeout(() => this.start(), delay);
          }
        }
      });
      
      this.sock.ev.on('creds.update', saveCreds);
      this.sock.ev.on('messages.upsert', async (m) => await this.handleMessages(m));
      this.sock.ev.on('group-participants.update', async (update) => await this.handleGroupUpdate(update));
    } catch (e) {
      logger.error('Bot start error: ' + e.message);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.start(), 5000);
      }
    }
  }
  
  handleDisconnect(lastDisconnect) {
    if (lastDisconnect && lastDisconnect.error instanceof Boom) {
      const sc = lastDisconnect.error.output ? lastDisconnect.error.output.statusCode : 0;
      if (sc === DisconnectReason.loggedOut || sc === DisconnectReason.badSession) {
        logger.info('🗑️ Session expired. Clearing session data...');
        try { fs.rmSync(SESSION_DIR, { recursive: true, force: true }); fs.mkdirSync(SESSION_DIR, { recursive: true }); } catch (e) {}
        this.pairingCode = null;
        return false;
      }
      return true;
    }
    return this.reconnectAttempts < this.maxReconnectAttempts;
  }
  
  async onConnected() {
    try {
      if (config.adminNumber && config.adminNumber !== '509XXXXXXXX') {
        await this.sendMessage(config.adminNumber + '@s.whatsapp.net', { text: '✅ *Victory Predict Bot* is now online! 🚀' });
      }
    } catch (e) {}
  }
  
  async handleMessages(messages) {
    for (const msg of messages.messages) {
      if (!msg.key || msg.key.fromMe) continue;
      if (msg.key.remoteJid === 'status@broadcast') continue;
      const jid = msg.key.remoteJid;
      const isGroup = jid.endsWith('@g.us');
      const sender = msg.key.participant || jid;
      let text = '', isImage = false, imageData = null;
      if (msg.message && msg.message.conversation) text = msg.message.conversation;
      else if (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) text = msg.message.extendedTextMessage.text;
      else if (msg.message && msg.message.imageMessage) { isImage = true; imageData = msg.message.imageMessage; text = msg.message.imageMessage.caption || ''; }
      else if (msg.message && msg.message.documentMessage) { isImage = true; imageData = msg.message.documentMessage; text = msg.message.documentMessage.caption || ''; }
      if (!text && !isImage) continue;
      if (isGroup) await this.handleGroupMessage(jid, sender, text, isImage, imageData, msg);
      else await this.handlePrivateMessage(jid, sender, text, isImage, imageData);
    }
  }
  
  async handlePrivateMessage(jid, sender, text, isImage, imageData) {
    let user = await User.findOne({ whatsappId: sender });
    if (!user) { user = await User.create({ whatsappId: sender, name: sender.split('@')[0] }); await this.sendMessage(jid, { text: t('welcome', user.language) }); }
    user.lastActive = new Date(); await user.save();
    if (isImage) { await this.handlePaymentScreenshot(jid, sender, user, imageData); return; }
    if (text.startsWith(config.prefix)) { await commandHandler.handle(user, text, async (r) => { await this.sendMessage(jid, { text: r }); }, this); }
  }
  
  async handleGroupMessage(jid, sender, text, isImage, imageData, rawMsg) {
    let group = await Group.findOne({ groupId: jid });
    if (!group) {
      try {
        const md = await this.sock.groupMetadata(jid);
        group = await Group.create({ groupId: jid, name: md.subject || 'Unknown', description: md.desc || '', addedBy: sender, memberCount: md.participants ? md.participants.length : 0 });
        logger.info('🆕 New group detected: ' + group.name);
      } catch (e) { return; }
    }
    if (!group.lastMetadataUpdate || Date.now() - new Date(group.lastMetadataUpdate).getTime() > 3600000) {
      try { const md = await this.sock.groupMetadata(jid); group.name = md.subject || group.name; group.memberCount = md.participants ? md.participants.length : 0; group.lastMetadataUpdate = new Date(); await group.save(); } catch (e) {}
    }
    if (!group.isEnabled && !text.startsWith('.enable')) return;
    if (group.settings.deleteLinks && /https?:\/\//.test(text)) {
      const isAdminSender = group.adminIds.includes(sender) || (await this.isGroupAdmin(jid, sender));
      if (!isAdminSender) { try { await this.sock.sendMessage(jid, { delete: rawMsg.key }); } catch (e) {} return; }
    }
    if (group.settings.antiBadWords && group.badWords && group.badWords.length > 0) {
      const hasBad = group.badWords.some(w => text.toLowerCase().includes(w.toLowerCase()));
      if (hasBad) { try { await this.sock.sendMessage(jid, { delete: rawMsg.key }); await this.sendMessage(jid, { text: '⚠️ @' + sender.split('@')[0] + ' Tanpri evite move langaj!', mentions: [sender] }); } catch (e) {} return; }
    }
    if (text.startsWith(config.prefix)) {
      let user = await User.findOne({ whatsappId: sender });
      if (!user) { user = await User.create({ whatsappId: sender, name: sender.split('@')[0], language: group.language || 'ht' }); }
      if (group.settings.adminOnlyCommands) {
        const isAdmin = group.adminIds.includes(sender) || (await this.isGroupAdmin(jid, sender));
        if (!isAdmin && !user.isAdmin) { await this.sendMessage(jid, { text: t('admin_only', user.language) }); return; }
      }
      await commandHandler.handle(user, text, async (r) => { await this.sendMessage(jid, { text: r }); }, this);
      group.totalMessages += 1; group.commandCount = (group.commandCount || 0) + 1; await group.save();
    }
  }
  
  async handleGroupUpdate(update) {
    const { id: gid, participants, action } = update;
    const group = await Group.findOne({ groupId: gid });
    if (!group || !group.isEnabled) return;
    for (const p of participants) {
      if (action === 'add' && group.settings.welcomeMessage !== false) {
        await this.sendMessage(gid, { text: '👋 Byenveni @' + p.split('@')[0] + ' nan *' + group.name + '*! 🎉', mentions: [p] });
      } else if (action === 'remove' && group.settings.goodbyeMessage !== false) {
        await this.sendMessage(gid, { text: '👋 Yon moun kite gwoup la.' });
      }
    }
    try { const md = await this.sock.groupMetadata(gid); group.memberCount = md.participants ? md.participants.length : 0; await group.save(); } catch (e) {}
  }
  
  async handlePaymentScreenshot(jid, sender, user, imageData) {
    const Payment = require('../models/Payment');
    const pending = await Payment.findOne({ whatsappId: sender, status: 'pending' }).sort({ createdAt: -1 });
    if (!pending) return;
    try {
      const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
      const stream = await downloadContentFromMessage(imageData, 'image');
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = 'payment-' + pending._id + '-' + Date.now() + '.jpg';
      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
      pending.screenshot = '/uploads/' + filename; await pending.save();
      await this.sendMessage(jid, { text: t('subscribe_screenshot_received', user.language) });
      const adminUser = await User.findOne({ isAdmin: true });
      if (adminUser && adminUser.whatsappId && !adminUser.whatsappId.startsWith('admin-')) {
        const planName = pending.plan === 'monthly' ? 'Monthly (4,500 HTG)' : 'Weekly (1,500 HTG)';
        await this.sendMessage(adminUser.whatsappId, { text: '📸 *NOUVO PAIEMENT*\n━━━━━━━━━━━━━━━━━\n\n👤 Itilizate: ' + user.name + '\n📱 WhatsApp: ' + sender.split('@')[0] + '\n💳 Plan: ' + planName + '\n📅 Dat: ' + new Date().toLocaleString() + '\n\n🔗 Ale nan Dashboard pou verifye!' });
      }
    } catch (e) { logger.error('Screenshot error: ' + e.message); }
  }
  
  async sendMessage(jid, content) {
    try { if (!this.sock || !this.isConnected) return null; return await this.sock.sendMessage(jid, content); } catch (e) { return null; }
  }
  
  async isGroupAdmin(groupId, participantId) {
    try {
      const md = await this.sock.groupMetadata(groupId);
      return md.participants.some(p => p.id === participantId && (p.admin === 'admin' || p.admin === 'superadmin'));
    } catch (e) { return false; }
  }
  
  getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      pairingCode: this.pairingCode,
      hasQR: !!this.qrCode
    };
  }
}

const bot = new WhatsAppBot();
module.exports = bot;
