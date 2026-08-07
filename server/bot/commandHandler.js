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
      case 'matches': case 'match': await this.matches(user, reply); break;
      case 'live': case 'live_score': await this.liveScore(user, reply); break;
      case 'results': case 'rezilta': await this.results(user, reply); break;
      case 'stats': case 'statistik': await this.stats(user, args, reply); break;
      case 'table': case 'klasman': await this.table(user, args, reply); break;
      case 'h2h': await this.headToHead(user, args, reply); break;
      case 'vip': await this.vip(user, reply); break;
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
      case 'settings': case 'paramet': await this.settings(user, reply); break;
      case 'contact': case 'kontak': await this.contact(user, reply); break;
      case 'broadcast': if (user.isAdmin) await this.broadcast(user, args, reply); else reply(t('admin_only', lang)); break;
      default: reply(t('unknown_command', lang));
    }} catch (e) { reply(t('error_general', lang)); }
  }
  checkVipAccess(user) { const isVip = user.isVipActive && user.isVipActive(); return isVip ? { allowed: true, isVip: true, dailyLimit: 20 } : { allowed: true, isVip: false, dailyLimit: 3 }; }
  async getTodayPredictionCount(user) { const today = new Date(); today.setHours(0,0,0,0); return Prediction.countDocuments({ requestedBy: user.whatsappId, createdAt: { $gte: today } }); }

  async menu(user, reply) {
    const isVip = user.isVipActive && user.isVipActive();
    let m = '╔══ VICTORY PREDICT ⚽ 🇭🇹 ══╗\n';
    m += '║    Bot Prediksyon #1     ║\n';
    m += '╚══════════════════════════╝\n\n';
    if (isVip) m += '💎 *OU SE VIP*\n━━━━━━━━━━━━━━━━━\n\n';
    else m += '🆓 *GRATIS* (3 prediksyon/jou)\n━━━━━━━━━━━━━━━━━\n\n';
    const cmds = [
      ['🌟 PREDIKSYON','.predict ekip1 vs ekip2'],
      ['🖼️ FLYER VIP','.flyer ekip1 vs ekip2 (VIP)'],
      ['📅 MATCH JODI A','.matches'],
      ['🔴 MATCH AN DIREK','.live'],
      ['📊 REZILTA','.results'],
      ['📈 ESTATISTIK','.stats ekip'],
      ['🏆 KLASMAN LIG','.table lig'],
      ['⚔️ HEAD TO HEAD','.h2h ekip1 vs ekip2'],
      ['💎 INFO VIP','.vip'],
      ['💳 ABONMAN','.subscribe'],
      ['📊 ESTATI KONT','.status'],
      ['📆 PREDIKSYON JODI A','.daily'],
      ['⭐ EKIP FAVORI','.favorite / .myfavorites'],
      ['🏟️ LIG YO','.leagues'],
      ['👤 PROFIL','.profile'],
      ['🌐 LANG','.language ht/en/fr'],
      ['🆘 ÈD','.help']
    ];
    cmds.forEach(c => m += '• ' + c[0] + '\n  ' + c[1] + '\n\n');
    m += '━━━━━━━━━━━━━━━━━\n⚡ Victory Predict AI\n🌐 @victorypredictht';
    reply(m);
  }

  async predict(user, args, reply) {
    const full = args.join(' '); const m = full.match(/^(.+?)\s+vs\s+(.+)$/i);
    if (!m) return reply('⚠️ *Format:* .predict Barcelona vs Real Madrid');
    const h = m[1].trim(), a = m[2].trim();
    const todayCount = await this.getTodayPredictionCount(user);
    const access = this.checkVipAccess(user);
    if (todayCount >= access.dailyLimit) {
      return reply('⚠️ *LIMIT RIVE!*\n\n🔮 Ou itilize *' + todayCount + '/' + access.dailyLimit + '* prediksyon.\n\n💎 *VIN VIP* pou 20 prediksyon/ jou!\n📅 Weekly: 1,500 HTG | Monthly: 4,500 HTG\n\n📋 .subscribe');
    }
    reply('🔮 *Analize* ' + h + ' ⚔️ ' + a + '...');
    let homeStats={},awayStats={},h2hData='';
    try { const [t1,t2,h2hR]=await Promise.allSettled([footballApi.getTeamStats(h),footballApi.getTeamStats(a),footballApi.getHeadToHead(h,a)]); if(t1.value)homeStats=t1.value; if(t2.value)awayStats=t2.value; if(h2hR.value&&h2hR.value.length)h2hData=h2hR.value.map(x=>x.homeTeam+' '+(x.homeScore||0)+'-'+(x.awayScore||0)+' '+x.awayTeam).join(', '); }catch(e){}
    const pred=await aiEngine.predictMatch({homeTeam:h,awayTeam:a,league:'Unknown',homeStats,awayStats,h2h:h2hData});
    const p=pred.predictions;
    let r = '╔══ PREDIKSYON ⚽ ═══════════╗\n';
    r += '║  ' + h.toUpperCase() + ' ⚔️ ' + a.toUpperCase() + '  ║\n';
    r += '╚══════════════════════════╝\n\n';
    r += '┌──────────────────────────┐\n';
    r += '│ 🎯 GAYAN: ' + p.winner.padEnd(18) + '│\n';
    r += '│ 🔄 DOUBLE: ' + p.doubleChance.padEnd(17) + '│\n';
    r += '│ ⚽ +1.5: ' + p.over15.padEnd(4) + '+2.5: ' + p.over25.padEnd(4) + '+3.5: ' + p.over35.padEnd(4) + '│\n';
    r += '│ 🎯 BTTS: ' + p.btts.padEnd(18) + '│\n';
    // VIP ONLY — Correct Score 🔒
    if (access.isVip) {
      r += '│ 📊 SKO: ' + p.correctScore.padEnd(19) + '│\n';
    } else {
      r += '│ 📊 SKO: 🔒 VIP SÈLMAN'.padEnd(28) + '│\n';
    }
    r += '│ 💪 KONFYANS: ' + String(p.confidence).padEnd(4) + '%'.padEnd(14) + '│\n';
    r += '└──────────────────────────┘\n\n';
    if (!access.isVip) r += '🔒 *SKO EGZAK = VIP SÈLMAN!*\n💎 .subscribe pou débloké!\n\n';
    r += '⚠️ Estimasyon, pa garanti.\n━━━━━━━━━━━━━━━━━\n⚡ Victory Predict AI | 🇭🇹';
    try { await Prediction.create({matchId:'m-'+Date.now(),homeTeam:h,awayTeam:a,league:'Unknown',matchDate:new Date(),predictions:p,analysis:pred.analysis,aiAnalysis:pred.aiAnalysis||'',requestedBy:user.whatsappId}); user.totalPredictions+=1;await user.save(); }catch(e){}
    reply(r);
  }

  async flyerPredict(user, args, reply) {
    if(!(user.isVipActive&&user.isVipActive())) return reply('💎 *.flyer* = VIP SÈLMAN!\n\n📋 .subscribe pou vin VIP.');
    const full=args.join(' ');const m=full.match(/^(.+?)\s+vs\s+(.+)$/i);if(!m)return reply('⚠️ .flyer Barcelona vs Real Madrid');
    const h=m[1].trim(),a=m[2].trim();reply('🖼️ Ap jenere flyer VIP...');
    let homeStats={},awayStats={},h2hData='';
    try{const[t1,t2,h2hR]=await Promise.allSettled([footballApi.getTeamStats(h),footballApi.getTeamStats(a),footballApi.getHeadToHead(h,a)]);if(t1.value)homeStats=t1.value;if(t2.value)awayStats=t2.value;if(h2hR.value&&h2hR.value.length)h2hData=h2hR.value.map(x=>x.homeTeam+' '+(x.homeScore||0)+'-'+(x.awayScore||0)+' '+x.awayTeam).join(', ');}catch(e){}
    const pred=await aiEngine.predictMatch({homeTeam:h,awayTeam:a,league:'Unknown',homeStats,awayStats,h2h:h2hData});const p=pred.predictions;
    let r='╔══ FLYER PREDIKSYON 💎 ═════╗\n║    💎 VIP EXCLUSIVE      ║\n╚══════════════════════════╝\n\n';
    r+='🏠 *'+h.toUpperCase()+'*\n'+'─'.repeat(22)+'\n      ⚔️  VS  ⚔️\n'+'─'.repeat(22)+'\n🚀 *'+a.toUpperCase()+'*\n\n';
    r+='┌──────────────────────────┐\n';
    r+='│ 🎯 GAYAN: '+p.winner.padEnd(18)+'│\n';
    r+='│ 🔄 DOUBLE: '+p.doubleChance.padEnd(17)+'│\n';
    r+='│ ⚽ +1.5: '+p.over15.padEnd(4)+'+2.5: '+p.over25.padEnd(4)+'+3.5: '+p.over35.padEnd(4)+'│\n';
    r+='│ 🎯 BTTS: '+p.btts.padEnd(18)+'│\n';
    r+='│ 📊 SKO: '+p.correctScore.padEnd(19)+'│\n';
    r+='│ 💪 KONFYANS: '+String(p.confidence).padEnd(4)+'%'.padEnd(14)+'│\n';
    r+='└──────────────────────────┘\n\n⚡ Victory Predict AI | 💎 VIP';
    reply(r);
    try{await Prediction.create({matchId:'m-'+Date.now(),homeTeam:h,awayTeam:a,league:'Unknown',matchDate:new Date(),predictions:p,analysis:pred.analysis,aiAnalysis:pred.aiAnalysis||'',requestedBy:user.whatsappId});user.totalPredictions+=1;await user.save();}catch(e){}
  }

  async vip(user,reply){
    const isVip=user.isVipActive&&user.isVipActive();
    let r='╔══ SISTÈM VIP 💎 ═══════════╗\n';
    if(isVip){
      r+='║  ✅ VIP AKTIF            ║\n╚══════════════════════════╝\n\n';
      r+='📅 Ekspire: '+new Date(user.vipExpiry).toLocaleDateString()+'\n🏅 '+ (user.level==='vip_monthly'?'💎 Monthly':'⭐ Weekly')+'\n\n*Avantaj ou:*\n🔮 20 prediksyon/jou\n📊 Correct Score ✅\n🖼️ Flyer prediksyon ✅\n📈 Estatistik avanse ✅\n\n💎 *Ou se VIP!* 🇭🇹';
    }else{
      r+='║  ❌ OU PA VIP           ║\n╚══════════════════════════╝\n\n';
      r+='🔒 Sko Egzak: BLOKE\n🔒 Flyer: BLOKE\n\n📅 Weekly: 1,500 HTG\n📅 Monthly: 4,500 HTG\n\n💡 *Avantaj VIP:*\n🔮 20 pred/jou (vs 3 gratis)\n📊 Correct Score EGZAK\n🖼️ Bèl flyer prediksyon\n📈 Estatistik avanse\n\n💳 *.subscribe* pou abòne!';
    }
    reply(r);
  }

  async status(user,reply){
    const isVip=user.isVipActive&&user.isVipActive();
    const levels={free:'🆓 Gratis',vip_weekly:'⭐ VIP Weekly',vip_monthly:'💎 VIP Monthly',admin:'👑 Admin'};
    const todayCount=await this.getTodayPredictionCount(user);const limit=isVip?20:3;
    let r='╔══ ESTATI KONT 📊 ══════════╗\n';
    r+='║ 👤 '+user.name+' ║\n╚══════════════════════════╝\n\n';
    r+='🏅 Nivo: *'+levels[user.level]+'*\n';
    if(isVip) r+='✅ VIP: Aktif jiska '+new Date(user.vipExpiry).toLocaleDateString()+'\n📊 Sko Egzak: ✅ Debloke\n';
    else r+='❌ VIP: Pa aktif\n📊 Sko Egzak: 🔐 Bloke\n';
    r+='🔮 Jodi a: *'+todayCount+'/'+limit+'*\n📊 Total: *'+user.totalPredictions+'*\n🌐 Lang: '+user.language.toUpperCase()+'\n';
    if(!isVip)r+='\n💡 .subscribe pou VIP!';
    reply(r);
  }

  async dailyPredictions(user,reply){
    reply('📆 Chache...');
    try{
      const today=new Date();today.setHours(0,0,0,0);
      const isVip=user.isVipActive&&user.isVipActive();
      const predictions=await Prediction.find({createdAt:{$gte:today}}).sort({createdAt:-1}).limit(isVip?10:5);
      if(!predictions.length)return reply('📆 Pa gen prediksyon jodi a.\n\n📋 .predict [ekip1] vs [ekip2]');
      let r='╔══ PREDIKSYON JODI A 📆 ═══╗\n╚══════════════════════════╝\n\n';
      predictions.forEach((p,i)=>{
        r+='*#'+(i+1)+'* '+p.homeTeam+' 🆚 '+p.awayTeam+'\n🎯 '+(p.predictions?.winner||'N/A')+' | 💪 '+(p.predictions?.confidence||'?')+'%\n';
        if(isVip)r+='📊 Sko: '+(p.predictions?.correctScore||'N/A')+' ✅\n';
        r+='─'.repeat(22)+'\n';
      });
      r+='⚡ Victory Predict AI';reply(r);
    }catch(e){reply('📆 Pa gen prediksyon jodi a.');}
  }

  async matches(user,reply){reply('📅 Chache...');try{const matches=await footballApi.getTodayMatches();if(!matches.length)return reply(t('matches_no_today',user.language));let r='╔══ MATCH JODI A 📅 ═══════╗\n╚══════════════════════════╝\n\n';matches.slice(0,15).forEach(m=>{const s=m.status==='live'?'🔴':m.status==='finished'?'✅':'⏰';r+=s+' *'+m.homeTeam+'* 🆚 *'+m.awayTeam+'*'+(m.homeScore!==null?' ('+m.homeScore+'-'+m.awayScore+')':'')+'\n   🏆 '+m.league+'\n\n';});r+='⚡ Victory Predict AI';reply(r);}catch(e){reply(t('error_general',user.language));}}

  async liveScore(user,reply){reply('🔴 Chache...');try{const live=await footballApi.getLiveMatches();if(!live.length)return reply('🔴 Pa gen match an direk.');let r='╔══ MATCH AN DIREK 🔴 ═════╗\n╚══════════════════════════╝\n\n';live.slice(0,10).forEach(m=>{r+='🔴 *'+m.homeTeam+' '+(m.homeScore||0)+' - '+(m.awayScore||0)+' '+m.awayTeam+'*\n   🏆 '+m.competition+'\n\n';});r+='⚡ Victory Predict AI';reply(r);}catch(e){reply(t('error_general',user.language));}}

  async results(user,reply){reply('📊 Chache...');try{const finished=await footballApi.getFinishedMatches();if(!finished.length)return reply('📊 Pa gen rezilta.');let r='╔══ DÈNYE REZILTA 📊 ══════╗\n╚══════════════════════════╝\n\n';finished.slice(0,15).forEach(m=>{r+='✅ *'+m.homeTeam+' '+m.homeScore+' - '+m.awayScore+' '+m.awayTeam+'*\n   🏆 '+m.competition+'\n\n';});r+='⚡ Victory Predict AI';reply(r);}catch(e){reply(t('error_general',user.language));}}

  async stats(user,args,reply){if(!args.length)return reply('📈 .stats [ekip]');reply('📈 Chache...');try{const stats=await footballApi.getTeamStats(args.join(' '));if(!stats)return reply('⚠️ Pa gen estatistik.');const isVip=user.isVipActive&&user.isVipActive();let r='╔══ ESTATISTIK 📈 ══════════╗\n╚══════════════════════════╝\n\n🎽 *'+args.join(' ').toUpperCase()+'*\n📊 Fòm: '+(stats.form||'N/A')+'\n🏆 Lig: '+(stats.league||'N/A')+'\n';if(stats.fixtures)r+='📅 Jwe: '+(stats.fixtures.played?.total||0)+' | ✅ Vik: '+(stats.fixtures.wins?.total||0)+'\n';if(isVip)r+='🛡️ Clean Sheets: '+(stats.cleanSheets?.total||0)+'\n';r+='⚡ Victory Predict AI';reply(r);}catch(e){reply(t('error_general',user.language));}}

  async table(user,args,reply){if(!args.length)return reply('🏆 .table premier league');reply('🏆 Chache...');try{const s=await footballApi.getStandings(args.join(' '));if(!s)return reply('⚠️ Pa gen klasman.');let r='╔══ KLASMAN 🏆 ═════════════╗\n╚══════════════════════════╝\n\n';s.standings.slice(0,10).forEach(t=>{r+='*'+t.rank+'.* '+t.team+'\n';});r+='⚡ Victory Predict AI';reply(r);}catch(e){reply(t('error_general',user.language));}}

  async headToHead(user,args,reply){const full=args.join(' ');const m=full.match(/^(.+?)\s+vs\s+(.+)$/i);if(!m)return reply('⚠️ .h2h Barcelona vs Real Madrid');reply('⚔️ Chache...');try{const h2h=await footballApi.getHeadToHead(m[1].trim(),m[2].trim());if(!h2h.length)return reply('⚠️ Pa gen done.');let r='╔══ HEAD TO HEAD ⚔️ ═══════╗\n╚══════════════════════════╝\n\n';h2h.slice(0,10).forEach(match=>{r+='• '+match.homeTeam+' '+(match.homeScore||'?')+' - '+(match.awayScore||'?')+' '+match.awayTeam+'\n';});r+='⚡ Victory Predict AI';reply(r);}catch(e){reply(t('error_general',user.language));}}

  async subscribe(user,args,reply){reply('💳 *ABÒNMAN VIP*\n\n📅 *.weekly* — 1,500 HTG\n📅 *.monthly* — 4,500 HTG\n\n1️⃣ Chwazi plan\n2️⃣ Peye MonCash/NatCash\n3️⃣ Voye screenshot');}
  async subscribePlan(user,plan,reply){if(!['weekly','monthly'].includes(plan))return reply('❌ Plan invalid.');try{const p=await Payment.findOne({whatsappId:user.whatsappId,status:'pending'});if(p)return reply('⏳ Peman an atant.');await paymentService.createPayment(user._id,user.whatsappId,plan,'moncash');const pc=config.vipPlans[plan];reply('💳 *'+plan.toUpperCase()+'*\n💰 '+pc.price+' HTG\n⏱️ '+pc.duration+' jou\n\n🔸 MonCash: '+config.paymentInfo.moncash.number+'\n🔸 NatCash: '+config.paymentInfo.natcash.number+'\n\n📸 Voye screenshot la a!');}catch(e){reply(t('error_general',user.language));}}

  async help(user,reply){let r='🆘 *ÈD & KÒMAND*\n';['.predict','Prediksyon match'],['.flyer','Flyer VIP (VIP)'],['.matches','Match jodi a'],['.live','Match an direk'],['.results','Rezilta'],['.stats','Estatistik ekip'],['.table','Klasman lig'],['.h2h','Head to Head'],['.vip','Info VIP'],['.subscribe','Abònman'],['.status','Estati kont'],['.daily','Prediksyon jodi a'],['.favorite','Ekip favori'],['.leagues','Lis lig'],['.search','Rechèche'],['.profile','Profil'],['.language','Lang'],['.help','Èd']].forEach(c=>r+='• *'+c[0]+'* — '+c[1]+'\n');r+='\n💎 .subscribe pou VIP!\n⚡ Victory Predict AI';reply(r);}

  async language(user,args,reply){if(!args.length)return reply('🌐 *.ht* 🇭🇹 | *.en* 🇺🇸 | *.fr* 🇫🇷');await this.setLang(user,args[0].toLowerCase(),reply);}
  async setLang(user,lang,reply){if(!['ht','en','fr'].includes(lang))return reply('❌ Lang invalid.');user.language=lang;await user.save();const names={ht:'Kreyòl 🇭🇹',en:'English 🇺🇸',fr:'Français 🇫🇷'};reply('✅ Lang: *'+names[lang]+'*');}
  async profile(user,reply){const isVip=user.isVipActive&&user.isVipActive();let r='👤 *PROFIL*
👤 '+user.name+'\n🏅 '+(isVip?'💎 VIP':'🆓 Gratis')+'\n🔮 Total: '+user.totalPredictions+'\n🌐 '+user.language.toUpperCase()+'\n';if(user.favoriteTeams?.length)r+='⭐ '+user.favoriteTeams.join(', ')+'\n';reply(r);}
  async settings(user,reply){reply('⚙️ *PARAMÈT*\n🔔 '+(user.settings?.notifications?'✅':'❌')+' | 🌐 '+user.language.toUpperCase());}
  async contact(user,reply){reply('📞 *KONTAK*\n📧 support@victorypredict.com\n📱 Admin: '+config.adminNumber);}
  async favorite(user,args,reply){if(!args.length)return reply('⭐ .favorite [ekip]');const tn=args.join(' ').replace(/^remove\s+/i,'');const ir=/^remove\s+/i.test(args.join(' '));if(!user.favoriteTeams)user.favoriteTeams=[];if(ir){user.favoriteTeams=user.favoriteTeams.filter(t=>t.toLowerCase()!==tn.toLowerCase());await user.save();return reply('✅ Retire.');}if(user.favoriteTeams.includes(tn))return reply('⚠️ Deja.');if(user.favoriteTeams.length>=5)return reply('⚠️ Max 5.');user.favoriteTeams.push(tn);await user.save();reply('⭐ *'+tn+'* ajoute!');}
  async myFavorites(user,reply){if(!user.favoriteTeams?.length)return reply('⭐ Pa gen ekip.');let r='⭐ *EKIP*
';user.favoriteTeams.forEach((t,i)=>{r+=(i+1)+'. '+t+'\n';});reply(r);}
  async search(args,reply){if(!args.length)return reply('🔍 .search [mo]');try{const teams=await footballApi.searchTeam(args.join(' '));if(!teams.length)return reply('🔍 Pa gen rezilta.');let r='🔍 *REZILTA*
';teams.slice(0,10).forEach(t=>{r+='• *'+t.name+'*\n';});reply(r);}catch(e){reply(t('error_general','ht'));}}
  async leagues(user,reply){const leagues=footballApi.getTopLeagues();let r='🏟️ *LIG*
';leagues.forEach(l=>{r+='• *'+l.name+'* ('+l.country+')
';});r+='\n.table [lig] pou klasman!';reply(r);}
  async broadcast(user,args,reply){const msg=args.join(' ');if(!msg)return reply('⚠️ .broadcast [mesaj]');await notificationService.create({type:'new_broadcast',title:'Broadcast',message:msg,targetType:'all'});reply('📢 Broadcast voye!');}
}
module.exports = new CommandHandler();
