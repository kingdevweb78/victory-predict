const config = require('../config');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Prediction = require('../models/Prediction');
const { t } = require('../services/languageService');
const aiEngine = require('../services/aiEngine');
const footballApi = require('../services/footballApi');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

class CommandHandler {
  async handle(user, text, reply) {
    const lang = user.language || 'ht';
    const cmd = text.slice(config.prefix.length).trim().toLowerCase().split(' ')[0];
    const args = text.slice(config.prefix.length).trim().split(' ').slice(1);
    try {
      switch (cmd) {
        case 'menu': case 'meni': await this.menu(user, reply); break;
        case 'predict': case 'prediksyon': await this.predict(user, args, reply); break;
        case 'matches': case 'match': await this.matches(user, reply); break;
        case 'results': case 'rezilta': await this.results(user, reply); break;
        case 'stats': case 'statistik': await this.stats(user, args, reply); break;
        case 'table': case 'klasman': await this.table(user, args, reply); break;
        case 'vip': await this.vip(user, reply); break;
        case 'subscribe': case 'abone': await this.subscribe(user, args, reply); break;
        case 'weekly': await this.subscribePlan(user, 'weekly', reply); break;
        case 'monthly': await this.subscribePlan(user, 'monthly', reply); break;
        case 'status': case 'estati': await this.status(user, reply); break;
        case 'help': case 'ed': case 'aide': await this.help(user, reply); break;
        case 'language': case 'lang': await this.language(user, args, reply); break;
        case 'ht': await this.setLang(user, 'ht', reply); break;
        case 'en': await this.setLang(user, 'en', reply); break;
        case 'fr': await this.setLang(user, 'fr', reply); break;
        case 'profile': case 'profil': await this.profile(user, reply); break;
        case 'settings': case 'paramet': await this.settings(user, reply); break;
        case 'contact': case 'kontak': await this.contact(user, reply); break;
        case 'broadcast': if (user.isAdmin) await this.broadcast(user, args, reply); else reply(t('admin_only', lang)); break;
        case 'admin': if (user.isAdmin) reply(`Admin Panel: ${config.adminUrl || '/admin'}`); else reply(t('admin_only', lang)); break;
        default: reply(t('unknown_command', lang));
      }
    } catch (e) { logger.error(`Command error (${cmd}): ${e.message}`); reply(t('error_general', lang)); }
  }

  async menu(user, reply) {
    const l = user.language;
    let m = `🔮 *${config.botName}* ⚽\n━━━━━━━━━━━━━━━━━\n📋 *${t('menu_title', l)}*\n━━━━━━━━━━━━━━━━━\n\n`;
    const cmds = [
      ['.predict', t('cmd_predict', l), '🔮'], ['.matches', t('cmd_matches', l), '📅'],
      ['.results', t('cmd_results', l), '📊'], ['.stats', t('cmd_stats', l), '📈'],
      ['.table', t('cmd_table', l), '🏆'], ['.vip', t('cmd_vip', l), '💎'],
      ['.subscribe', t('cmd_subscribe', l), '💳'], ['.status', t('cmd_status', l), '📊'],
      ['.profile', t('cmd_profile', l), '👤'], ['.language', t('cmd_language', l), '🌐'],
      ['.help', t('cmd_help', l), '🆘'], ['.contact', t('cmd_contact', l), '📞'],
    ];
    cmds.forEach(c => m += `${c[2]} ${c[0]} — _${c[1]}_\n\n`);
    m += `━━━━━━━━━━━━━━━━━\n⚡ Propulse pa Victory Predict AI`;
    reply(m);
  }

  async predict(user, args, reply) {
    const l = user.language;
    const full = args.join(' ');
    const m = full.match(/^(.+?)\s+vs\s+(.+)$/i);
    if (!m) return reply('⚠️ Format: .predict Barcelona vs Real Madrid');
    const h = m[1].trim(), a = m[2].trim();
    reply(`🔮 Analize ${h} vs ${a}...`);
    const pred = await aiEngine.predictMatch({ homeTeam: h, awayTeam: a, league: 'Unknown', homeStats: {}, awayStats: {}, h2h: '' });
    const p = pred.predictions;
    let r = `🔮 *PREDIKSYON*\n━━━━━━━━━━━━━━━━━\n\n🏠 *${h}* vs *${a}* 🚀\n\n`;
    r += `🏆 Gayan: ${p.winner}\n🔄 Double Chans: ${p.doubleChance}\n⚽ +1.5: ${p.over15}\n⚽ +2.5: ${p.over25}\n⚽ +3.5: ${p.over35}\n🎯 BTTS: ${p.btts}\n📊 Sko: ${p.correctScore}\n💪 Konfyans: ${p.confidence}%\n`;
    r += `━━━━━━━━━━━━━━━━━\n⚠️ Prediksyon yo se estimasyon. Pa garanti.\n⚡ Victory Predict AI`;
    try {
      await Prediction.create({ matchId: `m-${Date.now()}`, homeTeam: h, awayTeam: a, league: 'Unknown', matchDate: new Date(), predictions: p, analysis: pred.analysis, aiAnalysis: pred.aiAnalysis || '', requestedBy: user.whatsappId });
      user.totalPredictions += 1; await user.save();
    } catch (e) {}
    reply(r);
  }

  async matches(user, reply) {
    if (!footballApi.isConfigured()) return reply('⚠️ Done match pa disponib.');
    reply('📅 Chèche match...');
    try {
      const matches = await footballApi.getTodayMatches();
      if (!matches.length) return reply(t('matches_no_today', user.language));
      let r = `📅 *MATCH JODI A*\n━━━━━━━━━━━━━━━━━\n\n`;
      matches.slice(0, 15).forEach(m => {
        const s = m.status === 'live' ? '🔴' : '⏰';
        r += `${s} *${m.homeTeam}* vs *${m.awayTeam}*\n   🏆 ${m.league}\n\n`;
      });
      r += `⚡ Victory Predict AI`;
      reply(r);
    } catch (e) { reply(t('error_general', user.language)); }
  }

  async results(user, reply) { if (!footballApi.isConfigured()) return reply('⚠️ Pa disponib.'); reply(t('results_no_data', user.language)); }
  async stats(user, args, reply) { reply('📈 Tape .stats [ekip] — egzanp: .stats Barcelona'); }
  async table(user, args, reply) { reply('🏆 Tape .table [lig] — egzanp: .table premier league'); }

  async vip(user, reply) {
    const l = user.language;
    const isVip = user.isVipActive && user.isVipActive();
    let r = `💎 *VICTORY PREDICT VIP*\n━━━━━━━━━━━━━━━━━\n\n`;
    if (isVip) r += t('vip_active', l, { date: new Date(user.vipExpiry).toLocaleDateString() }) + '\n\n';
    r += `📅 VIP Weekly — 1,500 HTG / semèn\n📅 VIP Monthly — 4,500 HTG / mwa\n\n`;
    r += `💡 Avantaj: Prediksyon detaye, Estatistik avanse, Notifikasyon priyoritè\n\nTape *.subscribe* pou abòne!`;
    reply(r);
  }

  async subscribe(user, args, reply) {
    let r = `💳 *ABÒNMAN VIP*\n━━━━━━━━━━━━━━━━━\n\n`;
    r += `Chwazi plan ou:\n\n📅 *.weekly* — 1,500 HTG\n📅 *.monthly* — 4,500 HTG`;
    reply(r);
  }

  async subscribePlan(user, plan, reply) {
    if (!['weekly', 'monthly'].includes(plan)) return reply('❌ Plan invalid.');
    try {
      const pending = await Payment.findOne({ whatsappId: user.whatsappId, status: 'pending' });
      if (pending) return reply(`⏳ Ou deja gen yon peman an atant.\n\n${paymentService.getPaymentInstructions()}`);
      await paymentService.createPayment(user._id, user.whatsappId, plan, 'moncash');
      const pc = config.vipPlans[plan];
      let r = `💳 *ABÒNMAN ${plan.toUpperCase()}*\n━━━━━━━━━━━━━━━━━\n\n`;
      r += `📅 Plan: ${pc.name}\n💰 Pri: ${pc.price} HTG\n⏱️ Dire: ${pc.duration} jou\n\n`;
      r += `📲 *Enstriksyon Peman*\n\n🔸 MonCash: ${config.paymentInfo.moncash.number}\n🔸 NatCash: ${config.paymentInfo.natcash.number}\n\n📸 Voye screenshot peman an la a.`;
      reply(r);
    } catch (e) { reply(t('error_general', user.language)); }
  }

  async status(user, reply) {
    const isVip = user.isVipActive && user.isVipActive();
    const levels = { free: 'Gratis', vip_weekly: 'VIP Weekly ⭐', vip_monthly: 'VIP Monthly 💎', admin: 'Admin 👑' };
    let r = `📊 *ESTATI*\n━━━━━━━━━━━━━━━━━\n\n`;
    r += `👤 Non: ${user.name}\n⭐ Nivo: ${levels[user.level]}\n`;
    if (isVip) r += `✅ VIP: Aktif jiska ${new Date(user.vipExpiry).toLocaleDateString()}\n`;
    else r += `❌ VIP: Pa aktif\n`;
    r += `🔮 Prediksyon: ${user.totalPredictions}\n🌐 Lang: ${user.language.toUpperCase()}\n`;
    if (!isVip) r += `\n💡 Tape .subscribe pou VIP!`;
    reply(r);
  }

  async help(user, reply) {
    let r = `🆘 *ÈD*\n━━━━━━━━━━━━━━━━━\n\n`;
    [['.menu','Menu prensipal'],['.predict','Prediksyon match'],['.matches','Match jodi a'],['.results','Rezilta'],['.stats','Estatistik ekip'],['.table','Klasman lig'],['.vip','Info VIP'],['.subscribe','Abònman VIP'],['.status','Estati kont'],['.profile','Profil'],['.language','Chanje lang'],['.help','Èd'],['.contact','Kontak']].forEach(c => r += `• *${c[0]}* — ${c[1]}\n`);
    r += `\n⚡ Victory Predict AI`;
    reply(r);
  }

  async language(user, args, reply) {
    if (!args.length) return reply('Lang: .ht (Kreyòl), .en (English), .fr (Français)');
    await this.setLang(user, args[0].toLowerCase(), reply);
  }

  async setLang(user, lang, reply) {
    if (!['ht', 'en', 'fr'].includes(lang)) return reply('❌ Lang invalid.');
    user.language = lang; await user.save();
    const names = { ht: 'Kreyòl 🇭🇹', en: 'English 🇺🇸', fr: 'Français 🇫🇷' };
    reply(`✅ Lang chanje a *${names[lang]}*`);
  }

  async profile(user, reply) {
    const isVip = user.isVipActive && user.isVipActive();
    const levels = { free: '🆓 Gratis', vip_weekly: '⭐ VIP Weekly', vip_monthly: '💎 VIP Monthly', admin: '👑 Admin' };
    let r = `👤 *PROFIL*\n━━━━━━━━━━━━━━━━━\n\n`;
    r += `👤 Non: ${user.name}\n🏅 Nivo: ${levels[user.level]}\n`;
    if (isVip) r += `✅ VIP: Aktif jiska ${new Date(user.vipExpiry).toLocaleDateString()}\n`;
    r += `🔮 Prediksyon: ${user.totalPredictions}\n🌐 Lang: ${user.language.toUpperCase()}\n📅 Inskri: ${new Date(user.createdAt).toLocaleDateString()}\n`;
    reply(r);
  }

  async settings(user, reply) {
    let r = `⚙️ *PARAMÈT*\n━━━━━━━━━━━━━━━━━\n\n`;
    r += `🔔 Notifikasyon: ${user.settings?.notifications ? '✅ Aktive' : '❌ Dezaktive'}\n🌐 Lang: ${user.language.toUpperCase()}\n`;
    reply(r);
  }

  async contact(user, reply) { reply('📞 *KONTAK*\n━━━━━━━━━━━━━━━━━\n\n📧 support@victorypredict.com\n📱 WhatsApp: +509XXXXXXXX'); }

  async broadcast(user, args, reply) {
    const msg = args.join(' ');
    if (!msg) return reply('⚠️ .broadcast [mesaj]');
    await notificationService.create({ type: 'new_broadcast', title: 'Broadcast', message: msg, targetType: 'all' });
    reply(`📢 Broadcast voye!`);
  }
}

module.exports = new CommandHandler();