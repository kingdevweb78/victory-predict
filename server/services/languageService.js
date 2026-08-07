const translations = {
  ht: {
    welcome: '🇭🇹 *Byenveni nan Victory Predict!*\n🔮 Mwen se bot prediksyon foutbol ou a!\n\n📋 Komanse ak *.menu*\n🆘 Bezwen ed? *.help*',
    menu_title: 'MENI PRENSIPAL',
    unknown_command: '❌ Komand pa rekonet. Tape *.help* pou lis komand yo.',
    error_general: '⚠️ Yon ere te rive. Tanpri eseye anko.',
    admin_only: '⛔ Komand sa a se pou admin selman.',
    matches_no_today: '📅 Pa gen match jodi a.',
    subscribe_screenshot_received: '✅ *Screenshot peman resevwa!*\nAdmin ap verifye. Ou ap resevwa notifikasyon le VIP ou aktive.',
    no_vip_access: '💎 *Ou bezwen VIP!*\n\n📅 VIP Weekly: 1,500 HTG\n📅 VIP Monthly: 4,500 HTG\n\nTape *.subscribe* pou abone!',
    payment_approved: '✅ *PEMAN APWOUVE!* 🎉\n\nVIP ou aktive!\n🔮 20 prediksyon/ jou\n🖼️ Flyer prediksyon\n📊 Estatistik avanse\n\nMesi! 💎',
    payment_rejected: '❌ *PEMAN REJETE*\n\nScreenshot pa valide. Tanpri eseye anko.',
    vip_expiring_soon: '⚠️ *VIP OU AP EKSPIRE!*\n📅 Ekspirasyon: {date}\n💳 Renouvle: .subscribe',
    vip_expired: '❌ *VIP EKSPIRE*\n\nRenouvle: .subscribe',
    group_welcome: '👋 Byenveni nan {group}! 🎉',
    group_goodbye: '👋 Orevwa! Bonn chans!',
    cmd_predict: 'Prediksyon match', cmd_matches: 'Match jodi a', cmd_results: 'Rezilta',
    cmd_stats: 'Estatistik ekip', cmd_table: 'Klasman lig', cmd_vip: 'Enfomasyon VIP',
    cmd_subscribe: 'Abonman VIP', cmd_status: 'Estati kont', cmd_profile: 'Profil ou',
    cmd_language: 'Chanje lang', cmd_help: 'Ed ak komand', cmd_contact: 'Kontakte admin',
    vip_active: '✅ VIP Aktif jiska {date}',
  },
  en: {
    welcome: '🇺🇸 *Welcome to Victory Predict!*\n🔮 Your football prediction bot!\n\n📋 Start with *.menu*\n🆘 Help? *.help*',
    menu_title: 'MAIN MENU',
    unknown_command: '❌ Unknown command. Type *.help*.',
    error_general: '⚠️ An error occurred. Try again.',
    admin_only: '⛔ Admin only.',
    matches_no_today: '📅 No matches today.',
    subscribe_screenshot_received: '✅ *Payment screenshot received!*\nAdmin will verify.',
    no_vip_access: '💎 *VIP needed!*\n\n📅 Weekly: 1,500 HTG\n📅 Monthly: 4,500 HTG\n\nType *.subscribe*!',
    payment_approved: '✅ *PAYMENT APPROVED!* 🎉\n\nVIP active!\n🔮 20 pred/ day\n🖼️ Flyers\n📊 Advanced stats\n\nThank you! 💎',
    payment_rejected: '❌ *PAYMENT REJECTED*\n\nTry again or contact admin.',
    cmd_predict: 'Match prediction', cmd_matches: "Today's matches", cmd_results: 'Results',
    cmd_stats: 'Team stats', cmd_table: 'League table', cmd_vip: 'VIP info',
    cmd_subscribe: 'VIP subscription', cmd_status: 'Account status', cmd_profile: 'Your profile',
    cmd_language: 'Change language', cmd_help: 'Help', cmd_contact: 'Contact admin',
    vip_active: '✅ VIP Active until {date}',
    group_welcome: '👋 Welcome to {group}! 🎉', group_goodbye: '👋 Goodbye!',
  },
  fr: {
    welcome: '🇫🇷 *Bienvenue sur Victory Predict!*\n🔮 Bot de prediction!\n\n📋 *.menu*\n🆘 *.help*',
    menu_title: 'MENU PRINCIPAL',
    unknown_command: '❌ Commande inconnue. *.help*.',
    error_general: '⚠️ Erreur. Reessayez.',
    admin_only: '⛔ Admin seulement.',
    matches_no_today: "📅 Pas de matchs aujourd'hui.",
    no_vip_access: '💎 *VIP necessaire!*\n\n📅 Hebdo: 1,500 HTG\n📅 Mensuel: 4,500 HTG\n\n*.subscribe*!',
    payment_approved: '✅ *PAIEMENT APPROUVE!* 🎉\n\nVIP active! 💎',
    payment_rejected: '❌ *PAIEMENT REJETE*\n\nReessayez.',
    cmd_predict: 'Prediction', cmd_matches: 'Matchs du jour', cmd_results: 'Resultats',
    cmd_stats: 'Statistiques', cmd_table: 'Classement', cmd_vip: 'Info VIP',
    cmd_subscribe: 'Abonnement', cmd_status: 'Statut', cmd_profile: 'Profil',
    cmd_language: 'Langue', cmd_help: 'Aide', cmd_contact: 'Contact',
    vip_active: "✅ VIP Actif jusqu'au {date}",
    group_welcome: '👋 Bienvenue dans {group}! 🎉', group_goodbye: '👋 Au revoir!',
  }
};
const t = (key, lang, vars) => {
  lang = lang || 'ht'; vars = vars || {};
  let text = (translations[lang] && translations[lang][key]) ? translations[lang][key] : (translations['ht'][key] || key);
  Object.keys(vars).forEach(k => { text = text.replace('{' + k + '}', vars[k]); });
  return text;
};
module.exports = { t, translations };
