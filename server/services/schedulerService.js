const cron = require('node-cron');
const logger = require('../utils/logger');
const aiEngine = require('./aiEngine');
const footballApi = require('./footballApi');
const Prediction = require('../models/Prediction');
const User = require('../models/User');
const notificationService = require('./notificationService');

class SchedulerService {
  constructor() { this.jobs = []; }
  start() {
    this.jobs.push(cron.schedule('0 7 * * *', async () => { await this.generateDailyPredictions(); }));
    this.jobs.push(cron.schedule('0 9 * * *', async () => { await this.checkVipExpirations(); }));
    this.jobs.push(cron.schedule('0 0 * * 0', async () => { await notificationService.cleanOldNotifications(); }));
    this.jobs.push(cron.schedule('*/5 * * * *', async () => { await this.updateLiveScores(); }));
    logger.info('Scheduler started with ' + this.jobs.length + ' jobs');
  }
  async generateDailyPredictions() {
    try {
      const matches = await footballApi.getTodayMatches();
      if (!matches.length) return;
      const topMatches = matches.slice(0, 5);
      for (const match of topMatches) {
        const h2h = await footballApi.getHeadToHead(match.homeTeam, match.awayTeam);
        const h2hData = h2h && h2h.length ? h2h.map(m => m.homeTeam + ' ' + (m.homeScore || 0) + '-' + (m.awayScore || 0) + ' ' + m.awayTeam).join(', ') : '';
        const pred = await aiEngine.predictMatch({ homeTeam: match.homeTeam, awayTeam: match.awayTeam, league: match.league, homeStats: { form: 'N/A' }, awayStats: { form: 'N/A' }, h2h: h2hData });
        await Prediction.create({ matchId: match.matchId || 'm-' + Date.now(), homeTeam: match.homeTeam, awayTeam: match.awayTeam, league: match.league, matchDate: match.matchDate || new Date(), predictions: pred.predictions, analysis: pred.analysis, aiAnalysis: pred.aiAnalysis || '', requestedBy: 'auto-scheduler', isAutoPrediction: true });
      }
      await notificationService.create({ type: 'new_prediction', title: 'Daily Predictions', message: 'Prediksyon jodi a disponib! Tape .daily', targetType: 'all' });
      logger.info('Daily predictions: ' + topMatches.length + ' matches');
    } catch (error) { logger.error('Auto-prediction error: ' + error.message); }
  }
  async checkVipExpirations() {
    try {
      const now = new Date(); const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const expiring = await User.find({ vipExpiry: { $lte: threeDays, $gt: now }, level: { $in: ['vip_weekly', 'vip_monthly'] } });
      for (const u of expiring) { await notificationService.create({ type: 'vip_expiry', title: 'VIP Expiring', message: 'VIP ou ap ekspire sou ' + new Date(u.vipExpiry).toLocaleDateString() + '. Renouvle: .subscribe', targetType: 'user', targetId: u.whatsappId }); }
      const expired = await User.find({ vipExpiry: { $lte: now }, level: { $in: ['vip_weekly', 'vip_monthly'] } });
      for (const u of expired) { u.level = 'free'; u.vipExpiry = null; await u.save(); await notificationService.create({ type: 'vip_expired', title: 'VIP Expired', message: 'VIP ekspire. Renouvle: .subscribe', targetType: 'user', targetId: u.whatsappId }); }
    } catch (e) {}
  }
  async updateLiveScores() {}
  stop() { this.jobs.forEach(j => j.stop()); logger.info('Scheduler stopped'); }
}
module.exports = new SchedulerService();
