const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class FootballAPIService {
  constructor() {
    // ✅ FREE API — no API key needed!
    this.livescoreUrl = 'https://prexzyapis.com/sports/goallivescore';
    this.footballUrl = 'https://prexzyapis.com/sports/football';
    this.client = axios.create({ timeout: 15000 });
  }

  async getTodayMatches() {
    try {
      const response = await this.client.get(this.footballUrl, { params: { detail: 'matches', category: 'today' } });
      return this.formatMatches(response.data?.data?.matches || []);
    } catch (e) { return []; }
  }

  async getLiveMatches() {
    try {
      const response = await this.client.get(this.livescoreUrl);
      const competitions = response.data?.data || [];
      const all = [];
      for (const comp of competitions) {
        for (const match of comp.matches || []) {
          all.push({
            matchId: match.id, homeTeam: match.homeTeam, awayTeam: match.awayTeam,
            homeScore: match.homeScore, awayScore: match.awayScore,
            status: this.mapStatus(match.rawStatus),
            competition: comp.competition, area: comp.area, startTime: match.startTime,
            venue: match.venue || '', period: match.period || null
          });
        }
      }
      return all;
    } catch (e) { return []; }
  }

  async getFinishedMatches() {
    try {
      const response = await this.client.get(this.livescoreUrl);
      const competitions = response.data?.data || [];
      const finished = [];
      for (const comp of competitions) {
        for (const match of comp.matches || []) {
          if (match.rawStatus === 'RESULT') {
            finished.push({ matchId: match.id, homeTeam: match.homeTeam, awayTeam: match.awayTeam, homeScore: match.homeScore, awayScore: match.awayScore, competition: comp.competition, startTime: match.startTime });
          }
        }
      }
      return finished;
    } catch (e) { return []; }
  }

  async getHeadToHead(team1, team2) {
    try {
      const resp = await this.client.get(this.footballUrl, { params: { detail: 'matches', category: 'all' } });
      const matches = this.formatMatches(resp.data?.data?.matches || []);
      return matches.filter(m => (m.homeTeam.toLowerCase().includes(team1.toLowerCase()) && m.awayTeam.toLowerCase().includes(team2.toLowerCase())) || (m.homeTeam.toLowerCase().includes(team2.toLowerCase()) && m.awayTeam.toLowerCase().includes(team1.toLowerCase()))).slice(0, 10);
    } catch (e) { return []; }
  }

  async getStandings(leagueName) {
    try {
      const resp = await this.client.get(this.footballUrl, { params: { detail: 'matches', category: 'today' } });
      const all = this.formatMatches(resp.data?.data?.matches || []);
      const filtered = leagueName ? all.filter(m => m.league.toLowerCase().includes(leagueName.toLowerCase())) : all;
      if (!filtered.length) return null;
      return { league: { name: filtered[0].league, season: '2026' }, standings: filtered.slice(0, 20).map((m, i) => ({ rank: i + 1, team: m.homeTeam, points: 0 })) };
    } catch (e) { return null; }
  }

  async getTeamStats(teamName) {
    try {
      const resp = await this.client.get(this.footballUrl, { params: { detail: 'matches', category: 'all' } });
      const all = this.formatMatches(resp.data?.data?.matches || []);
      const tm = all.filter(m => m.homeTeam.toLowerCase().includes(teamName.toLowerCase()) || m.awayTeam.toLowerCase().includes(teamName.toLowerCase()));
      if (!tm.length) return null;
      const fin = tm.filter(m => m.status === 'finished');
      const wins = fin.filter(m => (m.homeTeam.toLowerCase().includes(teamName.toLowerCase()) && m.homeScore > m.awayScore) || (m.awayTeam.toLowerCase().includes(teamName.toLowerCase()) && m.awayScore > m.homeScore)).length;
      const draws = fin.filter(m => m.homeScore === m.awayScore && m.homeScore !== null).length;
      return { team: teamName, league: tm[0]?.league || 'Unknown', form: fin.slice(-5).map(m => { const ih = m.homeTeam.toLowerCase().includes(teamName.toLowerCase()); if (m.homeScore > m.awayScore) return ih ? 'W' : 'L'; if (m.homeScore < m.awayScore) return ih ? 'L' : 'W'; return 'D'; }).join('') || 'N/A', fixtures: { played: { total: tm.length }, wins: { total: wins }, draws: { total: draws }, loses: { total: fin.length - wins - draws } }, goals: { for: { total: { total: fin.reduce((s,m) => s + (m.homeTeam.toLowerCase().includes(teamName.toLowerCase()) ? m.homeScore : m.awayScore), 0) } } }, cleanSheets: { total: 0 } };
    } catch (e) { return null; }
  }

  async searchTeam(teamName) {
    try {
      const matches = await this.getTodayMatches();
      const teams = new Map();
      for (const m of matches) {
        if (m.homeTeam.toLowerCase().includes(teamName.toLowerCase())) teams.set(m.homeTeam, { name: m.homeTeam, country: m.country });
        if (m.awayTeam.toLowerCase().includes(teamName.toLowerCase())) teams.set(m.awayTeam, { name: m.awayTeam, country: m.country });
      }
      return Array.from(teams.values());
    } catch (e) { return []; }
  }

  getTopLeagues() {
    return [{ name: 'Premier League', country: 'England' },{ name: 'La Liga', country: 'Spain' },{ name: 'Serie A', country: 'Italy' },{ name: 'Bundesliga', country: 'Germany' },{ name: 'Ligue 1', country: 'France' },{ name: 'Eredivisie', country: 'Netherlands' },{ name: 'Primeira Liga', country: 'Portugal' },{ name: 'Super Lig', country: 'Turkey' }];
  }

  formatMatches(matches) {
    return matches.map(m => ({
      matchId: m.matchId?.toString(), homeTeam: m.homeName || 'Unknown', awayTeam: m.awayName || 'Unknown', league: m.leagueEn || 'Unknown', country: m.countryEn || null, matchDate: new Date(m.matchTime_t || Date.now()), status: this.mapFState(m.state), homeScore: m.homeScore ?? null, awayScore: m.awayScore ?? null, venue: m.location || '', season: m.season || ''
    }));
  }
  mapFState(s) { const m = { 0: 'scheduled', 1: 'live', 2: 'live', 3: 'live', '-1': 'finished' }; return m[String(s)] || 'scheduled'; }
  mapStatus(r) { const m = { FIXTURE: 'scheduled', LIVE: 'live', RESULT: 'finished' }; return m[r] || 'scheduled'; }
  isConfigured() { return true; }
}

module.exports = new FootballAPIService();
