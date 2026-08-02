const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class AIPredictionEngine {
  constructor() {
    this.apiKey = config.groqApiKey;
    this.model = config.aiModel;
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async predictMatch(matchData) {
    const { homeTeam, awayTeam, league, homeStats, awayStats, h2h } = matchData;
    const prompt = `Analyze this football match and provide predictions in JSON:

HOME: ${homeTeam} | AWAY: ${awayTeam} | League: ${league || 'Unknown'}

Home Stats: Form: ${homeStats?.form || 'N/A'}, Win Rate: ${homeStats?.winRate || 'N/A'}, Goals/Game: ${homeStats?.goalsScored || 'N/A'}, League Pos: ${homeStats?.leaguePosition || 'N/A'}
Away Stats: Form: ${awayStats?.form || 'N/A'}, Win Rate: ${awayStats?.winRate || 'N/A'}, Goals/Game: ${awayStats?.goalsScored || 'N/A'}, League Pos: ${awayStats?.leaguePosition || 'N/A'}
H2H: ${h2h || 'No data'}

Return ONLY JSON: { winner, doubleChance (1X/12/X2), over15 (Yes/No), over25 (Yes/No), over35 (Yes/No), btts (Yes/No), correctScore (X-X), confidence (10-95), analysis (string), attackStrength (Strong/Moderate/Weak), defenseStrength (Strong/Moderate/Weak), momentum (High/Moderate/Low) }`;

    try {
      const response = await axios.post(this.baseUrl, {
        model: this.model,
        messages: [{ role: 'system', content: 'You are a football prediction expert AI. Return only valid JSON.' }, { role: 'user', content: prompt }],
        temperature: 0.3, max_tokens: 1500, response_format: { type: 'json_object' }
      }, { headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' } });
      const ai = JSON.parse(response.data.choices[0].message.content);
      return {
        predictions: { winner: ai.winner, doubleChance: ai.doubleChance, over15: ai.over15, over25: ai.over25, over35: ai.over35, btts: ai.btts, correctScore: ai.correctScore, confidence: Math.min(95, Math.max(10, ai.confidence || 50)) },
        analysis: { attackStrength: ai.attackStrength, defenseStrength: ai.defenseStrength, momentum: ai.momentum },
        aiAnalysis: ai.analysis || ''
      };
    } catch (error) {
      logger.error(`AI Error: ${error.message}`);
      return { predictions: { winner: `${homeTeam} or Draw`, doubleChance: '1X', over15: 'Yes', over25: 'No', over35: 'No', btts: 'No', correctScore: '1-0', confidence: 45 }, analysis: { attackStrength: 'Moderate', defenseStrength: 'Moderate', momentum: 'Moderate' }, aiAnalysis: 'Statistical prediction. Limited data.', isFallback: true };
    }
  }
}

module.exports = new AIPredictionEngine();