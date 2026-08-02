const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class FootballAPIService {
  constructor() {
    this.baseUrl = 'https://prexzyapis.com/sports';
    this.client = axios.create({ timeout: 15000 });
  }

  async getTodayMatches() {
    try {
      const response = await this.client.get(`${this.baseUrl}/football`, { params: { detail: 'matches', category: 'today' } });
      return this.formatFootballMatches(response.data?.data?.matches || []);
    } catch (error) { logger.error(`Football API Error: ${error.message}`); return []; }
  }

  async getLiveMatches() {
    try {
      const response = await this.client.get(`${this.baseUrl}/goallivescore`);
      const competitions = response.data?.data || [];
      const allMatches = [];
      for (const comp of competitions) {
        for (const match of comp.matches || []) {
          allMatches.push({
            matchId: match.id, homeTeam: match.homeTeam, awayTeam: match.awayTeam,
            homeScore: match.homeScore, awayScore: match.awayScore,
            status: this.mapLiveStatus(match.rawStatus),
            competition: comp.competition, area: comp.area, startTime: match.startTime,
            venue: match.venue || '', homeLogo: null, awayLogo: null, leagueLogo: null,
            homeRedCards: match.homeRedCards || 0, awayRedCards: match.awayRedCards || 0,
            period: match.period || null,
          });
        }
      }
      return allMatches;
    } catch (error) { logger.error(`Live Score Error: ${error.message}`); return []; }
  }

  async getFinishedMatches() {
    try {
      const response = await this.client.get(`${this.baseUrl}/goallivescore`);
      const competitions = response.data?.data || [];
      const finished = [];
      for (const comp of competitions) {
        for (const match of comp.matches || []) {
          if (match.rawStatus === 'RESULT') {
            finished.push({ matchId: match.id, homeTeam: match.homeTeam, awayTeam: match.awayTeam, homeScore: match.homeScore, awayScore: match.awayScore, competition: comp.competition, area: comp.area, startTime: match.startTime, venue: match.venue || '', homeLogo: null, awayLogo: null, leagueLogo: null });
          }
        }
      }
      return finished;
    } catch (error) { return []; }
  }

  async getFixturesByDate(date) {
    try {
      const response = await this.client.get(`${this.baseUrl}/goallivescore`);
      const competitions = response.data?.data || [];
      const allMatches = [];
      for (const comp of competitions) {
        for (const match of comp.matches || []) {
          if (new Date(match.startTime).toISOString().split('T')[0] === date) {
            allMatches.push({ matchId: match.id, homeTeam: match.homeTeam, awayTeam: match.awayTeam, homeScore: match.homeScore, awayScore: match.awayScore, status: this.mapLiveStatus(match.rawStatus), competition: comp.competition, area: comp.area, matchDate: new Date(match.startTime), venue: match.venue || '', homeLogo: null, awayLogo: null, leagueLogo: null });
          }
        }
      }
      return allMatches;
    } catch (error) { return []; }
  }

  async getMatchById(matchId) {
    try {
      const response = await this.client.get(`${this.baseUrl}/football`, { params: { detail: 'matches', id: matchId } });
      const matches = this.formatFootballMatches(response.data?.data?.matches || []);
      if (matches.length) return matches[0];
      const live = await this.getLiveMatches();
      return live.find(m => m.matchId === matchId) || null;
    } catch (error) { return null; }
  }

  async searchTeam(teamName) {
    try {
      const matches = await this.getTodayMatches();
      const teams = new Map();
      for (const m of matches) {
        if (m.homeTeam.toLowerCase().includes(teamName.toLowerCase())) teams.set(m.homeTeam, { id: m.homeTeam, name: m.homeTeam, logo: m.homeLogo, country: m.country });
        if (m.awayTeam.toLowerCase().includes(teamName.toLowerCase())) teams.set(m.awayTeam, { id: m.awayTeam, name: m.awayTeam, logo: m.awayLogo, country: m.country });
      }
      return Array.from(teams.values());
    } catch (error) { return []; }
  }

  async getHeadToHead(team1, team2) {
    try {
      const resp = await this.client.get(`${this.baseUrl}/football`, { params: { detail: 'matches', category: 'all' } });
      const matches = this.formatFootballMatches(resp.data?.data?.matches || []);
      return matches.filter(m => (m.homeTeam.toLowerCase().includes(team1.toLowerCase()) && m.awayTeam.toLowerCase().includes(team2.toLowerCase())) || (m.homeTeam.toLowerCase().includes(team2.toLowerCase()) && m.awayTeam.toLowerCase().includes(team1.toLowerCase()))).slice(0, 10);
    } catch (error) { return []; }
  }

  async getStandings(leagueName) {
    try {
      const resp = await this.client.get(`${this.baseUrl}/football`, { params: { detail: 'matches', category: 'today' } });
      const all = this.formatFootballMatches(resp.data?.data?.matches || []);
      const filtered = leagueName ? all.filter(m => m.league.toLowerCase().includes(leagueName.toLowerCase())) : all;
      if (!filtered.length) return null;
      return { league: { name: filtered[0].league, logo: filtered[0].leagueLogo, season: '2026' }, standings: filtered.slice(0, 20).map((m, i) => ({ rank: i + 1, team: m.homeTeam, teamLogo: m.homeLogo, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0, form: '' })) };
    } catch (error) { return null; }
  }

  async getTeamStats(teamName) {
    try {
      const resp = await this.client.get(`${this.baseUrl}/football`, { params: { detail: 'matches', category: 'all' } });
      const all = this.formatFootballMatches(resp.data?.data?.matches || []);
      const tm = all.filter(m => m.homeTeam.toLowerCase().includes(teamName.toLowerCase()) || m.awayTeam.toLowerCase().includes(teamName.toLowerCase()));
      if (!tm.length) return null;
      const fin = tm.filter(m => m.status === 'finished');
      const wins = fin.filter(m => (m.homeTeam.toLowerCase().includes(teamName.toLowerCase()) && m.homeScore > m.awayScore) || (m.awayTeam.toLowerCase().includes(teamName.toLowerCase()) && m.awayScore > m.homeScore)).length;
      const draws = fin.filter(m => m.homeScore === m.awayScore && m.homeScore !== null).length;
      const form = fin.slice(-5).map(m => { const ih = m.homeTeam.toLowerCase().includes(teamName.toLowerCase()); if (m.homeScore > m.awayScore) return ih ? 'W' : 'L'; if (m.homeScore < m.awayScore) return ih ? 'L' : 'W'; return 'D'; }).join('');
      return { team: teamName, teamLogo: tm[0]?.homeLogo || null, league: tm[0]?.league || 'Unknown', form: form || 'N/A', fixtures: { played: { total: tm.length }, wins: { total: wins }, draws: { total: draws }, loses: { total: fin.length - wins - draws } }, goals: { for: { total: { total: fin.reduce((s, m) => s + (m.homeTeam.toLowerCase().includes(teamName.toLowerCase()) ? m.homeScore : m.awayScore), 0) } } }, cleanSheets: { total: 0 } };
    } catch (error) { return null; }
  }

  getTopLeagues() {
    return [{ id: 'Premier League', name: 'Premier League', country: 'England' },{ id: 'La Liga', name: 'La Liga', country: 'Spain' },{ id: 'Serie A', name: 'Serie A', country: 'Italy' },{ id: 'Bundesliga', name: 'Bundesliga', country: 'Germany' },{ id: 'Ligue 1', name: 'Ligue 1', country: 'France' }];
  }

  formatFootballMatches(matches) {
    return matches.map(m => ({ matchId: m.matchId?.toString(), homeTeam: m.homeName || 'Unknown', awayTeam: m.awayName || 'Unknown', homeLogo: m.homeLogoUrl || null, awayLogo: m.awayLogoUrl || null, league: m.leagueEn || 'Unknown', leagueLogo: m.leagueLogo || null, country: m.countryEn || null, matchDate: new Date(m.matchTime_t || Date.now()), status: this.mapFState(m.state), homeScore: m.homeScore ?? null, awayScore: m.awayScore ?? null, halfTime: { home: m.homeHalfScore ?? null, away: m.awayHalfScore ?? null }, venue: m.location || '', season: m.season || '' }));
  }

  mapFState(s) { const m = { 0: 'scheduled', 1: 'live', 2: 'live', 3: 'live', '-1': 'finished' }; return m[String(s)] || 'scheduled'; }
  mapLiveStatus(r) { const m = { FIXTURE: 'scheduled', LIVE: 'live', RESULT: 'finished', POSTPONED: 'postponed' }; return m[r] || 'scheduled'; }
  getFormEmoji(f) { if (!f || f === 'N/A') return 'N/A'; return f.split('').map(c => c === 'W' ? '🟢' : c === 'D' ? '🟡' : '🔴').join(''); }
  isConfigured() { return true; }
}

module.exports = new FootballAPIService();