const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  homeTeam: { type: String, required: true }, awayTeam: { type: String, required: true },
  homeLogo: { type: String, default: null }, awayLogo: { type: String, default: null },
  league: { type: String, required: true }, leagueLogo: { type: String, default: null },
  country: { type: String, default: null },
  matchDate: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'live', 'finished', 'postponed', 'cancelled'], default: 'scheduled' },
  minute: { type: Number, default: null },
  homeScore: { type: Number, default: null }, awayScore: { type: Number, default: null },
  halfTime: { home: { type: Number, default: null }, away: { type: Number, default: null } },
  fullTime: { home: { type: Number, default: null }, away: { type: Number, default: null } },
  events: [{ type: { type: String, enum: ['goal', 'card', 'substitution', 'var'] }, team: String, player: String, detail: String, minute: Number }],
  statistics: { possession: { home: Number, away: Number }, shots: { home: Number, away: Number }, shotsOnTarget: { home: Number, away: Number }, corners: { home: Number, away: Number }, fouls: { home: Number, away: Number }, yellowCards: { home: Number, away: Number }, redCards: { home: Number, away: Number } },
  odds: { homeWin: { type: Number, default: null }, draw: { type: Number, default: null }, awayWin: { type: Number, default: null } },
  venue: { type: String, default: null }, referee: { type: String, default: null }
}, { timestamps: true });

matchSchema.index({ matchDate: 1, status: 1 });
matchSchema.index({ league: 1, matchDate: -1 });

module.exports = mongoose.model('Match', matchSchema);