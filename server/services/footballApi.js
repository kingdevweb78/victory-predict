const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class FootballAPIService {
  constructor() {
    this.client = axios.create({ baseURL: config.footballApiUrl, headers: { 'x-apisports-key': config.footballApiKey }, timeout: 15000 });
  }

  async getTodayMatches() { try { const today = new Date().toISOString().split('T')[0]; const res = await this.client.get('/fixtures', { params: { date: today } }); return this.formatFixtures(res.data.response || []); } catch (e) { return []; } }
  async getFixturesByDate(date) { try { const res = await this.client.get('/fixtures', { params: { date } }); return this.formatFixtures(res.data.response || []); } catch (e) { return []; } }
  async getLiveMatches() { try { const res = await this.client.get('/fixtures', { params: { live: 'all' } }); return this.formatFixtures(res.data.response || []); } catch (e) { return []; } }
  async getMatchById(id) { try { const res = await this.client.get('/fixtures', { params: { id } }); const f = this.formatFixtures(res.data.response || []); return f[0] || null; } catch (e) { return null; } }
  
  async getStandings(leagueId, season) { try { const year = season || new Date().getFullYear(); const res = await this.client.get('/standings', { params: { league: leagueId, season: year } }); const data = res.data.response; if (!data || !data[0]) return null; const league = data[0].league; return { league: { id: league.id, name: league.name, logo: league.logo, season: league.season }, standings: (league.standings || []).flat().map(s => ({ rank: s.rank, team: s.team.name, teamLogo: s.team.logo, played: s.all.played, wins: s.all.win, draws: s.all.draw, losses: s.all.lose, goalsFor: s.all.goals.for, goalsAgainst: s.all.goals.against, goalDiff: s.goalsDiff, points: s.points, form: s.form })) }; } catch (e) { return null; } }
  
  async getTeamStats(teamId, leagueId, season) { try { const res = await this.client.get('/teams/statistics', { params: { team: teamId, league: leagueId, season: season || new Date().getFullYear() } }); const d = res.data.response; if (!d) return null; return { team: d.team.name, teamLogo: d.team.logo, league: d.league.name, form: d.form, fixtures: d.fixtures, goals: d.goals, cleanSheets: d.clean_sheet, cards: d.cards }; } catch (e) { return null; } }
  
  async getHeadToHead(team1Id, team2Id) { try { const res = await this.client.get('/fixtures/headtohead', { params: { h2h: `${team1Id}-${team2Id}`, last: 10 } }); return this.formatFixtures(res.data.response || []); } catch (e) { return []; } }
  
  async searchTeam(teamName) { try { const res = await this.client.get('/teams', { params: { search: teamName } }); return (res.data.response || []).map(t => ({ id: t.team.id, name: t.team.name, logo: t.team.logo, country: t.team.country })); } catch (e) { return []; } }
  
  getTopLeagues() { return [{ id: 39, name: 'Premier League', country: 'England' }, { id: 140, name: 'La Liga', country: 'Spain' }, { id: 135, name: 'Serie A', country: 'Italy' }, { id: 78, name: 'Bundesliga', country: 'Germany' }, { id: 61, name: 'Ligue 1', country: 'France' }, { id: 2, name: 'UCL', country: 'Europe' }]; }

  formatFixtures(fixtures) { return fixtures.map(f => ({ matchId: f.fixture?.id?.toString(), homeTeam: f.teams?.home?.name || 'Unknown', awayTeam: f.teams?.away?.name || 'Unknown', homeLogo: f.teams?.home?.logo || null, awayLogo: f.teams?.away?.logo || null, league: f.league?.name || 'Unknown', leagueLogo: f.league?.logo || null, matchDate: new Date(f.fixture?.date), status: this.mapStatus(f.fixture?.status?.short), minute: f.fixture?.status?.elapsed || null, homeScore: f.goals?.home ?? null, awayScore: f.goals?.away ?? null })); }
  
  mapStatus(s) { const m = { TBD:'scheduled',NS:'scheduled','1H':'live','2H':'live',ET:'live',P:'live',FT:'finished',AET:'finished',PEN:'finished',PST:'postponed',CANC:'cancelled' }; return m[s] || 'scheduled'; }
  getFormEmoji(form) { if (!form) return 'N/A'; return form.split('').map(c => c==='W'?'🟢':c==='D'?'🟡':'🔴').join(''); }
  isConfigured() { return !!config.footballApiKey && config.footballApiKey !== 'your_api_football_key'; }
}

module.exports = new FootballAPIService();