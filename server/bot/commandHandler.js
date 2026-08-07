const config = require('../config');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Prediction = require('../models/Prediction');
const { t } = require('../services/languageService');
const aiEngine = require('../services/aiEngine');
const footballApi = require('../services/footballApi');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');

class CommandHandler {
  async handle(user, text, reply, bot) {
    const lang = user.language || 'ht'; const cmd = text.slice(config.prefix.length).trim().toLowerCase().split(' ')[0]; const args = text.slice(config.prefix.length).trim().split(' ').slice(1);
    try { switch (cmd) {
      case 'menu': case 'meni': await this.menu(user, reply); break;
      case 'predict': case 'prediksyon': await this.predict(user, args, reply); break;
      case 'flyer': case 'flye': await this.flyerPredict(user, args, reply); break;
      case 'vip': await this.vip(user, reply); break;
      case 'matches': case 'match': await this.matches(user, reply); break;
      case 'live': case 'live_score': await this.liveScore(user, reply); break;
      case 'results': case 'rezilta': await this.results(user, reply); break;
      case 'stats': case 'statistik': await this.stats(user, args, reply); break;
      case 'table': case 'klasman': await this.table(user, args, reply); break;
      case 'h2h': await this.headToHead(user, args, reply); break;
      case 'subscribe': case 'abone': await this.subscribe(user, args, reply); break;
      case 'weekly': await this.subscribePlan(user, 'weekly', reply); break;
      case 'monthly': await this.subscribePlan(user, 'monthly', reply); break;
      case 'status': case 'estati': await this.status(user, reply); break;
      case 'daily': case 'chakjou': await this.dailyPredictions(user, reply); break;
      case 'favorite': case 'favori': await this.favorite(user, args, reply); break;
      case 'myfavorites': case 'favoris': await this.myFavorites(user, reply); break;
      case 'search': case 'chache': await this.search(args, reply); break;
      case 'leagues': case 'lig': await this.leagues(user, reply); break;
      case 'profile': case 'profil': await this.profile(user, reply); break;
      case 'help': case 'ed': case 'aide': await this.help(user, reply); break;
      case 'language': case 'lang': await this.language(user, args, reply); break;
      case 'ht': await this.setLang(user, 'ht', reply); break;
      case 'en': await this.setLang(user, 'en', reply); break;
      case 'fr': await this.setLang(user, 'fr', reply); break;
      case 'contact': case 'kontak': await this.contact(user, reply); break;
      case 'broadcast': if (user.isAdmin) await this.broadcast(user, args, reply); else reply(t('admin_only', lang)); break;
      default: reply('❌ Komand pa egziste.\n📋 Tape *.help* pou lis komand yo.');
    }} catch (e) { reply(t('error_general', lang)); }
  }
  checkVipAccess(user) { const isVip = user.isVipActive && user.isVipActive(); return isVip ? { allowed: true, isVip: true, dailyLimit: 20 } : { allowed: true, isVip: false, dailyLimit: 3 }; }
  async getTodayPredictionCount(user) { const today = new Date(); today.setHours(0,0,0,0); return Prediction.countDocuments({ requestedBy: user.whatsappId, createdAt: { $gte: today } }); }

  async predict(user, args, reply) {
    const full = args.join(' '); const m = full.match(/^(.+?)\s+vs\s+(.+)$/i);
    if (!m) return reply('⚠️ Format: .predict Barcelona vs Real Madrid');
    const h = m[1].trim(), a = m[2].trim();
    const access = this.checkVipAccess(user);
    const todayCount = await this.getTodayPredictionCount(user);
    if (todayCount >= access.dailyLimit) return reply('⚠️ Limit rive: ' + todayCount + '/' + access.dailyLimit + ' prediksyon jodi a.');
    reply('🔮 Analize ' + h + ' ⚔️ ' + a + '...');
    let leagueName = 'Unknown';
    try { const matches = await footballApi.getTodayMatches(); const found = matches.find(x => x.homeTeam.toLowerCase().includes(h.toLowerCase()) && x.awayTeam.toLowerCase().includes(a.toLowerCase())); if (found) leagueName = found.league; } catch(e) {}
    const pred = await aiEngine.predictMatch({ homeTeam: h, awayTeam: a, league: leagueName, homeStats: {}, awayStats: {}, h2h: '' });
    const p = pred.predictions; const isVip = access.isVip;
    let r = '';
    if (isVip) {
      r = '╔══ 💎 VIP ═══════════╗\n║   CORRECT SCORE     ║\n╚══════════════════════╝\n\n';
      r += '🏆 *' + leagueName.toUpperCase() + '*\n📅 ' + new Date().toLocaleDateString('en-GB') + '\n\n';
      r += '🏠 *' + h.toUpperCase() + '*\n          ⚔️ VS\n🚀 *' + a.toUpperCase() + '*\n\n';
      r += '┌──────────────────────┐\n│  🎯 CORRECT SCORE    │\n│     *CS ' + p.correctScore + '*'.padEnd(18) + '│\n│  ODDS: ' + this.calcOdds(p).padEnd(16) + '│\n│  KONFYANS: ' + String(p.confidence) + '%'.padEnd(12) + '│\n└──────────────────────┘\n\n🟡 PENDING\n💎 VIP | ⚡ Victory Predict AI';
    } else {
      r = '╔══ PREDIKSYON ⚽ ═════╗\n║   PREDIKSYON MATCH  ║\n╚══════════════════════╝\n\n';
      r += '🏆 *' + leagueName.toUpperCase() + '*\n📅 ' + new Date().toLocaleDateString('en-GB') + '\n\n';
      r += '🏠 *' + h.toUpperCase() + '*\n          ⚔️ VS\n🚀 *' + a.toUpperCase() + '*\n\n';
      r += '┌──────────────────────┐\n│  🎯 PREDIKSYON       │\n│                      │\n│  🔄 Double: ' + p.doubleChance.padEnd(10) + '│\n│  ⚽ +1.5: ' + p.over15.padEnd(12) + '│\n│  🎯 BTTS: ' + p.btts.padEnd(12) + '│\n│                      │\n│  💪 Konfyans: ' + String(p.confidence) + '%'.padEnd(12) + '│\n└──────────────────────┘\n\n⚠️ Estimasyon. Pa garanti.\n⚡ Victory Predict AI';
    }
    try { await Prediction.create({matchId:'m-'+Date.now(),homeTeam:h,awayTeam:a,league:leagueName,matchDate:new Date(),predictions:p,analysis:pred.analysis,aiAnalysis:pred.aiAnalysis||'',requestedBy:user.whatsappId}); user.totalPredictions+=1;await user.save(); }catch(e){}
    reply(r);
  }

  calcOdds(p) { const c = p.confidence || 50; if (c >= 80) return '10+'; if (c >= 70) return '7-10'; if (c >= 60) return '5-7'; if (c >= 50) return '3-5'; return '2-3'; }

  async flyerPredict(user, args, reply) {
    if(!(user.isVipActive&&user.isVipActive())) return reply('💎 *.flyer* = VIP SELMAN!\n📋 .subscribe pou aksede');
    const full=args.join(' ');const m=full.match(/^(.+?)\s+vs\s+(.+)$/i);if(!m)return reply('⚠️ .flyer Barcelona vs Real Madrid');
    const h=m[1].trim(),a=m[2].trim();reply('🖼️ Jenere flyer VIP...');
    let leagueName='Unknown';try{const matches=await footballApi.getTodayMatches();const found=matches.find(x=>x.homeTeam.toLowerCase().includes(h.toLowerCase())&&x.awayTeam.toLowerCase().includes(a.toLowerCase()));if(found)leagueName=found.league;}catch(e){}
    const pred=await aiEngine.predictMatch({homeTeam:h,awayTeam:a,league:leagueName,homeStats:{},awayStats:{},h2h:''});const p=pred.predictions;
    let r='╔══ FLYER VIP ═════════╗\n║   💎 CORRECT SCORE   ║\n╚══════════════════════╝\n\n🏆 *'+leagueName.toUpperCase()+'*\n📅 '+new Date().toLocaleDateString('en-GB')+'\n\n🏠 *'+h.toUpperCase()+'*\n'+'─'.repeat(22)+'\n      ⚔️ VS\n'+'─'.repeat(22)+'\n🚀 *'+a.toUpperCase()+'*\n\n┌──────────────────────┐\n│  🎯 CORRECT SCORE    │\n│     *CS '+p.correctScore+'*'.padEnd(18)+'│\n│  ODDS: '+this.calcOdds(p).padEnd(16)+'│\n│  KONFYANS: '+String(p.confidence)+'%'.padEnd(12)+'│\n└──────────────────────┘\n\n💎 VIP Exclusive | ⚡ Victory Predict AI';
    reply(r);
    try{await Prediction.create({matchId:'m-'+Date.now(),homeTeam:h,awayTeam:a,league:leagueName,matchDate:new Date(),predictions:p,analysis:pred.analysis,aiAnalysis:pred.aiAnalysis||'',requestedBy:user.whatsappId});user.totalPredictions+=1;await user.save();}catch(e){}
  }

  async vip(user,reply){
    const isVip=user.isVipActive&&user.isVipActive();
    let r='💎 *SISTEM VIP*\n━━━━━━━━━━━━━━━━━\n\n';
    if(isVip){r+='✅ *VIP AKTIF!*\n📅 Ekspire: '+new Date(user.vipExpiry).toLocaleDateString()+'\n\n🎯 Prediksyon VIP:\n📊 Correct Score EGZAK + ODDS\n🖼️ Bel flyer prediksyon\n📈 Estatistik avanse\n🔮 20 prediksyon/ jou\n\n💎 *Ou se VIP!* 🇭🇹';}
    else{r+='💡 *Enfo VIP*\n\n📅 Weekly: 1,500 HTG (7 jou)\n📅 Monthly: 4,500 HTG (30 jou)\n\n🎯 Avantaj VIP:\n📊 Correct Score EGZAK\n🖼️ Bel flyer prediksyon\n📈 Estatistik avanse\n🔮 20 prediksyon/ jou\n\n💳 *.subscribe* pou abone!';}
    reply(r);
  }

  async status(user,reply){
    const isVip=user.isVipActive&&user.isVipActive();
    const levels={free:'🆓 Gratis',vip_weekly:'⭐ VIP Weekly',vip_monthly:'💎 VIP Monthly',admin:'👑 Admin'};
    const todayCount=await this.getTodayPredictionCount(user);const limit=isVip?20:3;
    let r='📊 *ESTATI KONT*\n\n👤 *'+user.name+'*\n🏅 Nivo: *'+levels[user.level]+'*\n';
    if(isVip)r+='✅ VIP: Aktif jiska '+new Date(user.vipExpiry).toLocaleDateString()+'\n';
    r+='🔮 Jodi a: *'+todayCount+'/'+limit+'* prediksyon\n📊 Total: *'+user.totalPredictions+'*\n🌐 Lang: '+user.language.toUpperCase()+'\n';
    reply(r);
  }

  async menu(user, reply) {
    const isVip = user.isVipActive && user.isVipActive();
    let m = '⚽ *VICTORY PREDICT*\n━━━━━━━━━━━━━━━━━\n';
    if (isVip) m += '💎 *VIP AKTIF*\n\n';
    [['.predict','Prediksyon'],['.matches','Match jodi a'],['.live','Match an direk'],['.results','Rezilta'],['.stats','Estatistik'],['.table','Klasman'],['.h2h','Head to Head'],['.vip','Info VIP'],['.subscribe','Abonman VIP'],['.status','Estati kont'],['.daily','Prediksyon jodi a'],['.favorite','Ekip Favori'],['.leagues','Lis Lig'],['.profile','Profil'],['.help','Ed']].forEach(c=>m+='• *'+c[0]+'* — '+c[1]+'\n');
    m+='━━━━━━━━━━━━━━━━━\n⚡ Victory Predict AI';
    reply(m);
  }

  async matches(user,reply){try{const m=await footballApi.getTodayMatches();if(!m.length)return reply(t('matches_no_today',user.language));let r='📅 *MATCH JODI A*\n';m.slice(0,15).forEach(x=>{const s=x.status==='live'?'🔴':x.status==='finished'?'✅':'⏰';r+=s+' *'+x.homeTeam+'* 🆚 *'+x.awayTeam+'*'+(x.homeScore!==null?' ('+x.homeScore+'-'+x.awayScore+')':'')+'\n   🏆 '+x.league+'\n\n';});r+='⚡ Victory Predict AI';reply(r);}catch(e){reply(t('error_general',user.language));}}
  async liveScore(user,reply){try{const l=await footballApi.getLiveMatches();if(!l.length)return reply('🔴 Pa gen match an direk.');let r='🔴 *MATCH AN DIREK*\n';l.slice(0,10).forEach(x=>{r+='🔴 *'+x.homeTeam+' '+(x.homeScore||0)+' - '+(x.awayScore||0)+' '+x.awayTeam+'*\n🏆 '+x.competition+'\n\n';});r+='⚡ Victory Predict AI';reply(r);}catch(e){reply(t('error_general',user.language));}}
  async dailyPredictions(user,reply){try{const d=new Date();d.setHours(0,0,0,0);const v=user.isVipActive&&user.isVipActive();const p=await Prediction.find({createdAt:{$gte:d}}).sort({createdAt:-1}).limit(v?10:5);if(!p.length)return reply('📆 Pa gen prediksyon jodi a.');let r='📆 *PREDIKSYON JODI A*\n';p.forEach((x,i)=>{r+='*#'+(i+1)+'* '+x.homeTeam+' 🆚 '+x.awayTeam+'\n';if(v)r+='🎯 CS: '+(x.predictions?.correctScore||'?')+' | ODDS: '+this.calcOdds(x.predictions||{})+'
';else r+='🔄 '+(x.predictions?.doubleChance||'?')+' | ⚽ +1.5: '+(x.predictions?.over15||'?')+'\n';r+='─'.repeat(22)+'\n';});r+='⚡ Victory Predict AI';reply(r);}catch(e){reply('📆 Pa gen.');}}
  async results(user,reply){try{const f=await footballApi.getFinishedMatches();if(!f.length)return reply('📊 Pa gen rezilta.');let r='📊 *REZILTA*\n';f.slice(0,15).forEach(m=>{r+='✅ *'+m.homeTeam+' '+m.homeScore+' - '+m.awayScore+' '+m.awayTeam+'*\n🏆 '+m.competition+'\n\n';});r+='⚡ Victory Predict AI';reply(r);}catch(e){reply(t('error_general',user.language));}}
  async stats(user,args,reply){if(!args.length)return reply('📈 .stats [ekip]');try{const s=await footballApi.getTeamStats(args.join(' '));if(!s)return reply('⚠️ Pa gen.');const v=user.isVipActive&&user.isVipActive();let r='📈 *'+args.join(' ').toUpperCase()+'*\n📊 Fom: '+(s.form||'N/A')+'\n🏆 Lig: '+(s.league||'N/A')+'\n';if(s.fixtures)r+='📅 Jwe: '+(s.fixtures.played?.total||0)+'\n';if(v)r+='💎 Clean Sheets: '+(s.cleanSheets?.total||0)+'\n';r+='⚡ Victory Predict AI';reply(r);}catch(e){reply(t('error_general',user.language));}}
  async table(user,args,reply){if(!args.length)return reply('🏆 .table [lig]');try{const s=await footballApi.getStandings(args.join(' '));if(!s)return reply('⚠️ Pa gen.');let r='🏆 *KLASMAN*\n';s.standings.slice(0,10).forEach(t=>{r+='*'+t.rank+'.* '+t.team+'\n';});r+='⚡ Victory Predict AI';reply(r);}catch(e){reply(t('error_general',user.language));}}
  async headToHead(user,args,reply){const f=args.join(' ');const m=f.match(/^(.+?)\s+vs\s+(.+)$/i);if(!m)return reply('⚠️ .h2h Barcelona vs Real Madrid');try{const h2h=await footballApi.getHeadToHead(m[1].trim(),m[2].trim());if(!h2h.length)return reply('⚠️ Pa gen.');let r='⚔️ *H2H*\n';h2h.slice(0,10).forEach(x=>{r+='• '+x.homeTeam+' '+(x.homeScore||'?')+' - '+(x.awayScore||'?')+' '+x.awayTeam+'\n';});r+='⚡ Victory Predict AI';reply(r);}catch(e){reply(t('error_general',user.language));}}
  async subscribe(user,args,reply){reply('💳 *ABONMAN VIP*\n━━━━━━━━━━━━━━━━━\n\n📅 *.weekly* — 1,500 HTG (7 jou)\n📅 *.monthly* — 4,500 HTG (30 jou)\n\n💡 *Koman peye:*\n1️⃣ Chwazi plan (.weekly / .monthly)\n2️⃣ Voye lajan sou MonCash/NatCash\n3️⃣ Voye screenshot peman an isit la\n4️⃣ Admin verifye → VIP aktive ✅');}
  async subscribePlan(user,plan,reply){if(!['weekly','monthly'].includes(plan))return reply('❌ Plan invalid.');try{const p=await Payment.findOne({whatsappId:user.whatsappId,status:'pending'});if(p)return reply('⏳ Ou gen yon peman an atant.');await paymentService.createPayment(user._id,user.whatsappId,plan,'moncash');const pc=config.vipPlans[plan];reply('💳 *'+plan.toUpperCase()+'*\n\n💰 Pri: '+pc.price+' HTG\n⏱️ Dire: '+pc.duration+' jou\n\n📲 Peye sou:\n🔸 MonCash: '+config.paymentInfo.moncash.number+'\n🔸 NatCash: '+config.paymentInfo.natcash.number+'\n\n📸 Voye screenshot peman an la a!');}catch(e){reply(t('error_general',user.language));}}
  async help(user,reply){let r='🆘 *ED & KOMAND*\n\n';['.predict','Prediksyon'],['.matches','Match jodi a'],['.live','Match an direk'],['.results','Rezilta'],['.stats','Estatistik'],['.table','Klasman'],['.h2h','Head to Head'],['.vip','Info VIP'],['.subscribe','Abonman VIP'],['.status','Estati'],['.daily','Prediksyon jodi a'],['.favorite','Ekip favori'],['.leagues','Lis lig'],['.profile','Profil'],['.language','Lang'],['.help','Ed']].forEach(c=>r+='• *'+c[0]+'* — '+c[1]+'\n');r+='\n⚡ Victory Predict AI';reply(r);}
  async language(user,args,reply){if(!args.length)return reply('🌐 *.ht* 🇭🇹 | *.en* 🇺🇸 | *.fr* 🇫🇷');await this.setLang(user,args[0].toLowerCase(),reply);}
  async setLang(user,lang,reply){if(!['ht','en','fr'].includes(lang))return reply('❌ Invalid.');user.language=lang;await user.save();const n={ht:'Kreyol 🇭🇹',en:'English 🇺🇸',fr:'Francais 🇫🇷'};reply('✅ Lang: *'+n[lang]+'*');}
  async profile(user,reply){const v=user.isVipActive&&user.isVipActive();let r='👤 *PROFIL*\n\n👤 '+user.name+'\n🏅 '+(v?'💎 VIP':'🆓 Gratis')+'\n🔮 Total: '+user.totalPredictions+'\n🌐 '+user.language.toUpperCase()+'\n';if(user.favoriteTeams?.length)r+='⭐ '+user.favoriteTeams.join(', ')+'\n';reply(r);}
  async contact(user,reply){reply('📞 *KONTAK*\n\nsupport@victorypredict.com\nAdmin: '+config.adminNumber);}
  async favorite(user,args,reply){if(!args.length)return reply('⭐ .favorite [ekip]');const tn=args.join(' ').replace(/^remove\s+/i,'');const ir=/^remove\s+/i.test(args.join(' '));if(!user.favoriteTeams)user.favoriteTeams=[];if(ir){user.favoriteTeams=user.favoriteTeams.filter(t=>t.toLowerCase()!==tn.toLowerCase());await user.save();return reply('✅ Retire.');}if(user.favoriteTeams.includes(tn))return reply('⚠️ Deja.');if(user.favoriteTeams.length>=5)return reply('⚠️ Max 5.');user.favoriteTeams.push(tn);await user.save();reply('⭐ *'+tn+'* ajoute!');}
  async myFavorites(user,reply){if(!user.favoriteTeams?.length)return reply('⭐ Pa gen ekip.');let r='⭐ *EKIP FAVORI*
';user.favoriteTeams.forEach((t,i)=>{r+=(i+1)+'. '+t+'\n';});reply(r);}
  async search(args,reply){if(!args.length)return reply('🔍 .search [mo]');try{const t=await footballApi.searchTeam(args.join(' '));if(!t.length)return reply('🔍 Pa gen rezilta.');let r='🔍 *REZILTA*
';t.slice(0,10).forEach(x=>{r+='• *'+x.name+'*\n';});reply(r);}catch(e){reply(t('error_general','ht'));}}
  async leagues(user,reply){const l=footballApi.getTopLeagues();let r='🏟️ *LIG SUPOTE*
';l.forEach(x=>{r+='• *'+x.name+'* ('+x.country+')\n';});r+='\n📋 .table [lig] pou klasman!';reply(r);}
  async broadcast(user,args,reply){const msg=args.join(' ');if(!msg)return reply('⚠️ .broadcast [mesaj]');await notificationService.create({type:'new_broadcast',title:'Broadcast',message:msg,targetType:'all'});reply('📢 Voye!');}
}
module.exports = new CommandHandler();
