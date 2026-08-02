const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
  fetchLatestBaileysVersion
} = require('@adiwajshing/baileys');
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
  constructor() {
    this.sock = null;
    this.store = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  async start() {
    try {
      if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
      this.store = makeInMemoryStore({ logger: pino({ level: 'silent' }) });
      const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
      const { version } = await fetchLatestBaileysVersion();

      this.sock = makeWASocket({
        version, auth: state, printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ['Victory Predict', 'Chrome', '1.0.0'],
        getMessage: async (key) => {
          if (this.store) { const msg = await this.store.loadMessage(key.remoteJid, key.id); return msg?.message || undefined; }
          return undefined;
        }
      });

      this.store.bind(this.sock.ev);

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) logger.info('Scan QR Code');
        if (connection === 'open') {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          logger.info('WhatsApp Bot Connected!');
          await this.onConnected();
        }
        if (connection === 'close') {
          this.isConnected = false;
          const shouldReconnect = this.handleDisconnect(lastDisconnect);
          if (shouldReconnect) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            setTimeout(() => this.start(), delay);
          }
        }
      });

      this.sock.ev.on('creds.update', saveCreds);
      this.sock.ev.on('messages.upsert', async (m) => await this.handleMessages(m));
      this.sock.ev.on('group-participants.update', async (update) => await this.handleGroupUpdate(update));
    } catch (error) {
      logger.error(`Bot Startup Error: ${error.message}`);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.start(), 5000);
      }
    }
  }

  handleDisconnect(lastDisconnect) {
    if (lastDisconnect?.error instanceof Boom) {
      const statusCode = lastDisconnect.error.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut || statusCode === DisconnectReason.badSession) {
        try { fs.rmSync(SESSION_DIR, { recursive: true, force: true }); fs.mkdirSync(SESSION_DIR, { recursive: true }); } catch (e) {}
        return false;
      }
      return true;
    }
    return this.reconnectAttempts < this.maxReconnectAttempts;
  }

  async onConnected() {
    logger.info(`Bot connected`);
  }

  async handleMessages(messages) {
    for (const msg of messages.messages) {
      if (!msg.key || msg.key.fromMe) continue;
      if (msg.key.remoteJid === 'status@broadcast') continue;
      const jid = msg.key.remoteJid;
      const isGroup = jid.endsWith('@g.us');
      const sender = msg.key.participant || jid;
      let text = '';
      let isImage = false;
      let imageData = null;
      if (msg.message?.conversation) text = msg.message.conversation;
      else if (msg.message?.extendedTextMessage?.text) text = msg.message.extendedTextMessage.text;
      else if (msg.message?.imageMessage) { isImage = true; imageData = msg.message.imageMessage; text = msg.message.imageMessage.caption || ''; }
      else if (msg.message?.documentMessage) { isImage = true; imageData = msg.message.documentMessage; }
      if (!text && !isImage) continue;

      if (isGroup) {
        await this.handleGroupMessage(jid, sender, text, isImage, imageData, msg);
      } else {
        await this.handlePrivateMessage(jid, sender, text, isImage, imageData);
      }
    }
  }

  async handlePrivateMessage(jid, sender, text, isImage, imageData) {
    let user = await User.findOne({ whatsappId: sender });
    if (!user) { user = await User.create({ whatsappId: sender, name: sender.split('@')[0] }); await this.sendMessage(jid, { text: t('welcome', user.language) }); }
    user.lastActive = new Date(); await user.save();
    if (isImage) { await this.handlePaymentScreenshot(jid, sender, user, imageData); return; }
    if (text.startsWith(config.prefix)) {
      await commandHandler.handle(user, text, async (r) => { await this.sendMessage(jid, { text: r }); });
    }
  }

  async handleGroupMessage(jid, sender, text, isImage, imageData, rawMsg) {
    let group = await Group.findOne({ groupId: jid });
    if (!group) {
      try { const md = await this.sock.groupMetadata(jid); group = await Group.create({ groupId: jid, name: md.subject || 'Unknown', addedBy: sender }); } catch (e) { return; }
    }
    if (!group.isEnabled && !text.startsWith('.enable')) return;
    if (group.settings.deleteLinks && /https?:\/\//.test(text)) { await this.sock.sendMessage(jid, { delete: rawMsg.key }); return; }
    if (text.startsWith(config.prefix)) {
      let user = await User.findOne({ whatsappId: sender });
      if (!user) { user = await User.create({ whatsappId: sender, name: sender.split('@')[0], language: group.language || 'ht' }); }
      if (group.settings.adminOnlyCommands) {
        const isAdmin = group.adminIds.includes(sender) || (await this.isGroupAdmin(jid, sender));
        if (!isAdmin && !user.isAdmin) { await this.sendMessage(jid, { text: t('admin_only', user.language) }); return; }
      }
      await commandHandler.handle(user, text, async (r) => { await this.sendMessage(jid, { text: r }); });
      group.totalMessages += 1; await group.save();
    }
  }

  async handleGroupUpdate(update) {
    const { id: gid, participants, action } = update;
    const group = await Group.findOne({ groupId: gid });
    if (!group || !group.isEnabled) return;
    for (const p of participants) {
      if (action === 'add') await this.sendMessage(gid, { text: t('group_welcome', group.language, { group: group.name }) });
      else if (action === 'remove') await this.sendMessage(gid, { text: t('group_goodbye', group.language, { group: group.name }) });
    }
  }

  async handlePaymentScreenshot(jid, sender, user, imageData) {
    const Payment = require('../models/Payment');
    const pending = await Payment.findOne({ whatsappId: sender, status: 'pending' }).sort({ createdAt: -1 });
    if (!pending) return;
    try {
      const { downloadContentFromMessage } = require('@adiwajshing/baileys');
      const stream = await downloadContentFromMessage(imageData, 'image');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `payment-${pending._id}-${Date.now()}.jpg`;
      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
      pending.screenshot = `/uploads/${filename}`;
      await pending.save();
      await this.sendMessage(jid, { text: t('subscribe_screenshot_received', user.language) });
    } catch (e) { logger.error(`Screenshot error: ${e.message}`); }
  }

  async sendMessage(jid, content) {
    try { if (!this.sock || !this.isConnected) return null; return await this.sock.sendMessage(jid, content); } catch (e) { return null; }
  }

  async isGroupAdmin(groupId, participantId) {
    try { const md = await this.sock.groupMetadata(groupId); return md.participants.some(p => p.id === participantId && (p.admin === 'admin' || p.admin === 'superadmin')); } catch (e) { return false; }
  }

  getStatus() { return { connected: this.isConnected, reconnectAttempts: this.reconnectAttempts }; }
}

const bot = new WhatsAppBot();
module.exports = bot;