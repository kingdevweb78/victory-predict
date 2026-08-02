const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  matchId: { type: String, required: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  league: { type: String, required: true },
  leagueLogo: { type: String, default: null },
  matchDate: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'live', 'finished'], default: 'scheduled' },
  analysis: {
    homeForm: { type: String, default: 'N/A' }, awayForm: { type: String, default: 'N/A' },
    headToHead: { type: String, default: 'N/A' }, homeGoalsScored: { type: Number, default: 0 },
    homeGoalsConceded: { type: Number, default: 0 }, awayGoalsScored: { type: Number, default: 0 },
    awayGoalsConceded: { type: Number, default: 0 }, homeWinRate: { type: String, default: '0%' },
    awayWinRate: { type: String, default: '0%' }, attackStrength: { type: String, default: 'N/A' },
    defenseStrength: { type: String, default: 'N/A' }, momentum: { type: String, default: 'N/A' }
  },
  predictions: {
    winner: { type: String, default: 'N/A' }, doubleChance: { type: String, default: 'N/A' },
    over15: { type: String, default: 'N/A' }, over25: { type: String, default: 'N/A' },
    over35: { type: String, default: 'N/A' }, btts: { type: String, default: 'N/A' },
    correctScore: { type: String, default: 'N/A' }, confidence: { type: Number, default: 50 }
  },
  actualResult: { homeScore: { type: Number, default: null }, awayScore: { type: Number, default: null }, winner: { type: String, default: null }, btts: { type: Boolean, default: null }, over25: { type: Boolean, default: null } },
  isCorrect: { type: Boolean, default: null },
  aiAnalysis: { type: String, default: '' },
  isVipOnly: { type: Boolean, default: false },
  requestedBy: { type: String, default: null }
}, { timestamps: true });

predictionSchema.index({ matchId: 1 });
predictionSchema.index({ matchDate: 1, status: 1 });
predictionSchema.index({ league: 1, matchDate: -1 });

module.exports = mongoose.model('Prediction', predictionSchema);