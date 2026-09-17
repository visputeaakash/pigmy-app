/* ========================================
   PIGMY PWA — i18n (Internationalization)
   EN / मराठी / हिंदी language support
   ======================================== */

const LANG = {
  en: {
    // Header
    'header.title': '🏦 Pigmy Strategist',
    'header.subtitle': 'Live Sync • Full CRUD Dashboard',
    'header.offline': 'Offline',

    // Nav
    'nav.home': 'Home',
    'nav.add': 'Add',
    'nav.cutoff': 'Cutoff',
    'nav.audit': 'Audit',
    'nav.more': 'More',

    // Login
    'login.title': '🔒 Secure Login',
    'login.subtitle': 'Please log in to access your ledger.',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.btn': 'Login Securely',

    // Dashboard KPIs
    'kpi.corpus': 'Total Net Corpus',
    'kpi.corpus.sub': 'Accessible Emergency Fund',
    'kpi.sunday.sub': 'Sunday Runs',
    'kpi.audit.sub': 'Slips unprinted',
    'kpi.accounts.sub': 'Active Accounts',

    // Analytics KPIs
    'kpi.avgDaily': 'Avg Daily Collection',
    'kpi.bestAccount': 'Best Performing',
    'kpi.consistency': 'Consistency Score',
    'kpi.staleness': 'Days Since Last',

    // Quick Actions
    'quick.title': '🚀 Quick Actions',
    'quick.log': '📝 Log Collection',
    'quick.audit': '🔎 View Audit Trail',

    // Charts
    'chart.monthly': '📈 Monthly Collection Trend',
    'chart.distribution': '🍩 Account Distribution',
    'chart.daily': '📉 Last 30 Days Activity',

    // Risk Analysis
    'risk.title': '🔍 Risk Analysis',
    'risk.high': 'High Risk',
    'risk.medium': 'Medium Risk',
    'risk.low': 'Low Risk',
    'risk.noCollection': 'No collection in 30+ days',
    'risk.inconsistent': 'Inconsistent deposits',
    'risk.regular': 'Regular & consistent',

    // Portfolio Advantages
    'portfolio.title': '🏛️ Portfolio Advantages',
    'portfolio.emergency': 'Emergency Coverage',
    'portfolio.diversification': 'Diversification',
    'portfolio.growth': 'Monthly Growth',

    // Tips
    'tips.title': '💡 Fund Management Tips',

    // Add Feed
    'feed.title': '📝 Log Daily / Weekly Collection',
    'feed.account': 'Target Account',
    'feed.date': 'Collection Date',
    'feed.amount': 'Amount (₹)',
    'feed.deductions': 'Deductions (₹)',
    'feed.slip': 'Slip / Receipt No',
    'feed.verified': 'Already printed in passbook?',
    'feed.notes': 'Notes',
    'feed.save': 'Save Collection',

    // Cutoff
    'cutoff.title': '📅 Fast Month-End Cutoff',
    'cutoff.account': 'Account',
    'cutoff.date': 'Cutoff Date',
    'cutoff.amount': 'Total Amount (₹)',
    'cutoff.ref': 'Ref / Passbook Stamp',
    'cutoff.save': 'Record Month-End Total',

    // Add Account
    'account.title': '🏦 Register New Account',
    'account.number': 'Account Number',
    'account.holder': 'Holder Name',
    'account.bank': 'Bank / Society',
    'account.agent': 'Agent Name',
    'account.frequency': 'Frequency',
    'account.openDate': 'Opening Date',
    'account.save': 'Register Account',

    // Portfolios
    'portfolios.title': '🏛️ Account Portfolios',
    'portfolios.add': '+ Add',
    'portfolios.bank': 'Bank / Society',
    'portfolios.accNo': 'Acc No',
    'portfolios.agentCol': 'Agent',
    'portfolios.balance': 'Balance',
    'portfolios.status': 'Status',
    'portfolios.action': 'Action',

    // Audit
    'audit.title': '🔎 Collections Audit Trail',
    'audit.search': 'Search:',
    'audit.filter': 'Filter:',
    'audit.allAccounts': '-- All Accounts --',
    'audit.dateCol': 'Date',
    'audit.bankCol': 'Bank',
    'audit.netCol': 'Net',
    'audit.statusCol': 'Status',
    'audit.actionsCol': 'Actions',
    'audit.loadMore': 'Load More Entries',

    // Export
    'export.title': '📊 Export Data',
    'export.subtitle': 'Generate CSV or Markdown reports locally on your device.',
    'export.csv': '📥 Download CSV',
    'export.md': '📄 Download AI MD Dossier',

    // More Menu
    'more.title': 'More Options',
    'more.portfolios': '🏛️ Account Portfolios',
    'more.addAccount': '🏦 Add New Account',
    'more.export': '📊 Export Data',
    'more.logout': '🚪 Logout',

    // Account Details
    'detail.balance': 'Current Balance',
    'detail.status': 'Status',
    'detail.accNo': 'Account No:',
    'detail.holder': 'Holder Name:',
    'detail.agent': 'Agent Name:',
    'detail.freq': 'Frequency:',
    'detail.opened': 'Opened:',
    'detail.timeline': 'Transaction Timeline',
    'detail.back': 'Back',

    // Frequency options
    'freq.daily': 'Daily',
    'freq.weekly': 'Weekly',
    'freq.monthly': 'Monthly'
  },

  mr: {
    // Header
    'header.title': '🏦 पिग्मी व्यवस्थापक',
    'header.subtitle': 'लाइव्ह सिंक • संपूर्ण डॅशबोर्ड',
    'header.offline': 'ऑफलाइन',

    // Nav
    'nav.home': 'मुख्यपृष्ठ',
    'nav.add': 'जोडा',
    'nav.cutoff': 'कटऑफ',
    'nav.audit': 'तपासणी',
    'nav.more': 'अधिक',

    // Login
    'login.title': '🔒 सुरक्षित लॉगिन',
    'login.subtitle': 'कृपया तुमच्या खात्यात लॉगिन करा.',
    'login.email': 'ईमेल पत्ता',
    'login.password': 'पासवर्ड',
    'login.btn': 'सुरक्षित लॉगिन',

    // Dashboard KPIs
    'kpi.corpus': 'एकूण निव्वळ जमा',
    'kpi.corpus.sub': 'आपत्कालीन निधी',
    'kpi.sunday.sub': 'रविवार भेटी',
    'kpi.audit.sub': 'स्लिप्स अनमुद्रित',
    'kpi.accounts.sub': 'सक्रिय खाती',

    // Analytics KPIs
    'kpi.avgDaily': 'सरासरी दैनिक जमा',
    'kpi.bestAccount': 'सर्वोत्तम खाते',
    'kpi.consistency': 'सातत्य गुण',
    'kpi.staleness': 'शेवटच्या जमा पासून',

    // Quick Actions
    'quick.title': '🚀 जलद कृती',
    'quick.log': '📝 जमा नोंदवा',
    'quick.audit': '🔎 तपासणी पहा',

    // Charts
    'chart.monthly': '📈 मासिक जमा ट्रेंड',
    'chart.distribution': '🍩 खातेनिहाय वाटप',
    'chart.daily': '📉 गेल्या ३० दिवसांचा आढावा',

    // Risk Analysis
    'risk.title': '🔍 जोखीम विश्लेषण',
    'risk.high': 'उच्च जोखीम',
    'risk.medium': 'मध्यम जोखीम',
    'risk.low': 'कमी जोखीम',
    'risk.noCollection': '३०+ दिवस जमा नाही',
    'risk.inconsistent': 'अनियमित जमा',
    'risk.regular': 'नियमित आणि सातत्यपूर्ण',

    // Portfolio Advantages
    'portfolio.title': '🏛️ पोर्टफोलिओ फायदे',
    'portfolio.emergency': 'आपत्कालीन संरक्षण',
    'portfolio.diversification': 'विविधीकरण',
    'portfolio.growth': 'मासिक वाढ',

    // Tips
    'tips.title': '💡 निधी व्यवस्थापन टिप्स',

    // Add Feed
    'feed.title': '📝 दैनिक / साप्ताहिक जमा नोंदवा',
    'feed.account': 'लक्ष्य खाते',
    'feed.date': 'जमा तारीख',
    'feed.amount': 'रक्कम (₹)',
    'feed.deductions': 'वजावट (₹)',
    'feed.slip': 'स्लिप / पावती क्र.',
    'feed.verified': 'पासबुकमध्ये छापलेले आहे?',
    'feed.notes': 'टिपा',
    'feed.save': 'जमा जतन करा',

    // Cutoff
    'cutoff.title': '📅 जलद महिना-अंत कटऑफ',
    'cutoff.account': 'खाते',
    'cutoff.date': 'कटऑफ तारीख',
    'cutoff.amount': 'एकूण रक्कम (₹)',
    'cutoff.ref': 'संदर्भ / पासबुक शिक्का',
    'cutoff.save': 'महिना-अंत नोंद करा',

    // Add Account
    'account.title': '🏦 नवीन खाते नोंदणी',
    'account.number': 'खाते क्रमांक',
    'account.holder': 'खातेधारक नाव',
    'account.bank': 'बँक / संस्था',
    'account.agent': 'एजंट नाव',
    'account.frequency': 'वारंवारता',
    'account.openDate': 'उघडण्याची तारीख',
    'account.save': 'खाते नोंदवा',

    // Portfolios
    'portfolios.title': '🏛️ खाते पोर्टफोलिओ',
    'portfolios.add': '+ जोडा',
    'portfolios.bank': 'बँक / संस्था',
    'portfolios.accNo': 'खाते क्र.',
    'portfolios.agentCol': 'एजंट',
    'portfolios.balance': 'शिल्लक',
    'portfolios.status': 'स्थिती',
    'portfolios.action': 'कृती',

    // Audit
    'audit.title': '🔎 जमा तपासणी ट्रेल',
    'audit.search': 'शोधा:',
    'audit.filter': 'फिल्टर:',
    'audit.allAccounts': '-- सर्व खाती --',
    'audit.dateCol': 'तारीख',
    'audit.bankCol': 'बँक',
    'audit.netCol': 'निव्वळ',
    'audit.statusCol': 'स्थिती',
    'audit.actionsCol': 'कृती',
    'audit.loadMore': 'अधिक नोंदी लोड करा',

    // Export
    'export.title': '📊 डेटा निर्यात',
    'export.subtitle': 'तुमच्या डिव्हाइसवर CSV किंवा Markdown अहवाल तयार करा.',
    'export.csv': '📥 CSV डाउनलोड करा',
    'export.md': '📄 AI MD डॉसियर डाउनलोड करा',

    // More Menu
    'more.title': 'अधिक पर्याय',
    'more.portfolios': '🏛️ खाते पोर्टफोलिओ',
    'more.addAccount': '🏦 नवीन खाते जोडा',
    'more.export': '📊 डेटा निर्यात',
    'more.logout': '🚪 बाहेर पडा',

    // Account Details
    'detail.balance': 'सध्याची शिल्लक',
    'detail.status': 'स्थिती',
    'detail.accNo': 'खाते क्र.:',
    'detail.holder': 'खातेधारक:',
    'detail.agent': 'एजंट:',
    'detail.freq': 'वारंवारता:',
    'detail.opened': 'उघडले:',
    'detail.timeline': 'व्यवहार टाइमलाइन',
    'detail.back': 'मागे',

    // Frequency options
    'freq.daily': 'दैनिक',
    'freq.weekly': 'साप्ताहिक',
    'freq.monthly': 'मासिक'
  },

  hi: {
    // Header
    'header.title': '🏦 पिग्मी रणनीतिकार',
    'header.subtitle': 'लाइव सिंक • पूर्ण डैशबोर्ड',
    'header.offline': 'ऑफलाइन',

    // Nav
    'nav.home': 'होम',
    'nav.add': 'जोड़ें',
    'nav.cutoff': 'कटऑफ',
    'nav.audit': 'ऑडिट',
    'nav.more': 'और',

    // Login
    'login.title': '🔒 सुरक्षित लॉगिन',
    'login.subtitle': 'कृपया अपने खाते में लॉगिन करें।',
    'login.email': 'ईमेल पता',
    'login.password': 'पासवर्ड',
    'login.btn': 'सुरक्षित लॉगिन',

    // Dashboard KPIs
    'kpi.corpus': 'कुल शुद्ध कोष',
    'kpi.corpus.sub': 'आपातकालीन निधि',
    'kpi.sunday.sub': 'रविवार दौरे',
    'kpi.audit.sub': 'स्लिप अमुद्रित',
    'kpi.accounts.sub': 'सक्रिय खाते',

    // Analytics KPIs
    'kpi.avgDaily': 'औसत दैनिक जमा',
    'kpi.bestAccount': 'सर्वश्रेष्ठ खाता',
    'kpi.consistency': 'निरंतरता स्कोर',
    'kpi.staleness': 'अंतिम जमा से',

    // Quick Actions
    'quick.title': '🚀 त्वरित कार्य',
    'quick.log': '📝 जमा दर्ज करें',
    'quick.audit': '🔎 ऑडिट देखें',

    // Charts
    'chart.monthly': '📈 मासिक जमा ट्रेंड',
    'chart.distribution': '🍩 खातावार वितरण',
    'chart.daily': '📉 पिछले 30 दिन',

    // Risk Analysis
    'risk.title': '🔍 जोखिम विश्लेषण',
    'risk.high': 'उच्च जोखिम',
    'risk.medium': 'मध्यम जोखिम',
    'risk.low': 'कम जोखिम',
    'risk.noCollection': '30+ दिन कोई जमा नहीं',
    'risk.inconsistent': 'असंगत जमा',
    'risk.regular': 'नियमित और सुसंगत',

    // Portfolio Advantages
    'portfolio.title': '🏛️ पोर्टफोलियो लाभ',
    'portfolio.emergency': 'आपातकालीन कवरेज',
    'portfolio.diversification': 'विविधीकरण',
    'portfolio.growth': 'मासिक वृद्धि',

    // Tips
    'tips.title': '💡 निधि प्रबंधन सुझाव',

    // Add Feed
    'feed.title': '📝 दैनिक / साप्ताहिक जमा दर्ज करें',
    'feed.account': 'लक्ष्य खाता',
    'feed.date': 'जमा तिथि',
    'feed.amount': 'राशि (₹)',
    'feed.deductions': 'कटौती (₹)',
    'feed.slip': 'स्लिप / रसीद नं.',
    'feed.verified': 'पासबुक में मुद्रित?',
    'feed.notes': 'नोट्स',
    'feed.save': 'जमा सहेजें',

    // Cutoff
    'cutoff.title': '📅 त्वरित माह-अंत कटऑफ',
    'cutoff.account': 'खाता',
    'cutoff.date': 'कटऑफ तिथि',
    'cutoff.amount': 'कुल राशि (₹)',
    'cutoff.ref': 'संदर्भ / पासबुक स्टैम्प',
    'cutoff.save': 'माह-अंत कुल दर्ज करें',

    // Add Account
    'account.title': '🏦 नया खाता पंजीकरण',
    'account.number': 'खाता संख्या',
    'account.holder': 'खातेधारक का नाम',
    'account.bank': 'बैंक / संस्था',
    'account.agent': 'एजेंट का नाम',
    'account.frequency': 'आवृत्ति',
    'account.openDate': 'खुलने की तिथि',
    'account.save': 'खाता पंजीकृत करें',

    // Portfolios
    'portfolios.title': '🏛️ खाता पोर्टफोलियो',
    'portfolios.add': '+ जोड़ें',
    'portfolios.bank': 'बैंक / संस्था',
    'portfolios.accNo': 'खाता नं.',
    'portfolios.agentCol': 'एजेंट',
    'portfolios.balance': 'शेष',
    'portfolios.status': 'स्थिति',
    'portfolios.action': 'कार्रवाई',

    // Audit
    'audit.title': '🔎 जमा ऑडिट ट्रेल',
    'audit.search': 'खोजें:',
    'audit.filter': 'फ़िल्टर:',
    'audit.allAccounts': '-- सभी खाते --',
    'audit.dateCol': 'तिथि',
    'audit.bankCol': 'बैंक',
    'audit.netCol': 'शुद्ध',
    'audit.statusCol': 'स्थिति',
    'audit.actionsCol': 'कार्रवाई',
    'audit.loadMore': 'और प्रविष्टियाँ लोड करें',

    // Export
    'export.title': '📊 डेटा निर्यात',
    'export.subtitle': 'अपने डिवाइस पर CSV या Markdown रिपोर्ट बनाएं।',
    'export.csv': '📥 CSV डाउनलोड करें',
    'export.md': '📄 AI MD दस्तावेज़ डाउनलोड करें',

    // More Menu
    'more.title': 'और विकल्प',
    'more.portfolios': '🏛️ खाता पोर्टफोलियो',
    'more.addAccount': '🏦 नया खाता जोड़ें',
    'more.export': '📊 डेटा निर्यात',
    'more.logout': '🚪 लॉग आउट',

    // Account Details
    'detail.balance': 'वर्तमान शेष',
    'detail.status': 'स्थिति',
    'detail.accNo': 'खाता नं.:',
    'detail.holder': 'खातेधारक:',
    'detail.agent': 'एजेंट:',
    'detail.freq': 'आवृत्ति:',
    'detail.opened': 'खुला:',
    'detail.timeline': 'लेन-देन टाइमलाइन',
    'detail.back': 'वापस',

    // Frequency options
    'freq.daily': 'दैनिक',
    'freq.weekly': 'साप्ताहिक',
    'freq.monthly': 'मासिक'
  }
};

// Tips per language
const TIPS = {
  en: [
    "Consolidating accounts reduces agent risk exposure.",
    "Verify passbook stamps monthly to catch discrepancies early.",
    "Sunday collections earn compound benefit over 12 months.",
    "Keep at least 3 months' expenses in your emergency fund.",
    "Track every ₹100 — small deposits compound into big savings.",
    "Diversify across 2-3 banks to reduce institutional risk.",
    "Review your risk analysis weekly for early warning signs.",
    "Export your data as CSV monthly for backup & tax records."
  ],
  mr: [
    "खाती एकत्रित केल्याने एजंटचा धोका कमी होतो.",
    "पासबुक शिक्के दर महिन्याला तपासा.",
    "रविवारची जमा १२ महिन्यांत चक्रवाढ फायदा देते.",
    "आपत्कालीन निधीमध्ये किमान ३ महिन्यांचा खर्च ठेवा.",
    "प्रत्येक ₹१०० चे ट्रॅकिंग करा — लहान जमा मोठी बचत बनते.",
    "संस्थागत जोखीम कमी करण्यासाठी २-३ बँकांमध्ये वैविध्य ठेवा.",
    "लवकर चेतावणीसाठी दर आठवड्याला जोखीम विश्लेषण पहा.",
    "बॅकअप आणि कर नोंदींसाठी दर महिन्याला CSV निर्यात करा."
  ],
  hi: [
    "खातों को समेकित करने से एजेंट जोखिम कम होता है।",
    "विसंगतियों को पकड़ने के लिए मासिक पासबुक स्टैम्प जांचें।",
    "रविवार की जमा 12 महीनों में चक्रवृद्धि लाभ देती है।",
    "अपने आपातकालीन कोष में कम से कम 3 महीने का खर्च रखें।",
    "हर ₹100 का ट्रैक रखें — छोटी जमा बड़ी बचत बनती है।",
    "संस्थागत जोखिम कम करने के लिए 2-3 बैंकों में विविधता रखें।",
    "प्रारंभिक चेतावनी के लिए साप्ताहिक जोखिम विश्लेषण देखें।",
    "बैकअप और कर रिकॉर्ड के लिए मासिक CSV निर्यात करें।"
  ]
};

// ---- State ----
let currentLang = localStorage.getItem('pigmy_lang') || 'en';
let tipIndex = 0;
let tipInterval = null;

// ---- Core Functions ----

function t(key) {
  return (LANG[currentLang] && LANG[currentLang][key]) || LANG.en[key] || key;
}

function setLanguage(langCode) {
  currentLang = langCode;
  localStorage.setItem('pigmy_lang', langCode);

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (el.tagName === 'INPUT' && el.type !== 'hidden') {
      if (el.placeholder) el.placeholder = translated;
    } else {
      el.textContent = translated;
    }
  });

  // Update language button label
  const langBtn = document.getElementById('btn-lang');
  if (langBtn) {
    const labels = { en: 'EN', mr: 'मरा', hi: 'हिं' };
    langBtn.textContent = '🌐 ' + (labels[langCode] || 'EN');
  }

  // Restart tips in new language
  startTipsRotation();
  
  // Re-render dynamic lists if they exist
  if (typeof renderPortfolios === 'function') renderPortfolios();
  if (typeof renderAuditTrail === 'function') renderAuditTrail();
}

function cycleLang() {
  const order = ['en', 'mr', 'hi'];
  const idx = order.indexOf(currentLang);
  const next = order[(idx + 1) % order.length];
  setLanguage(next);
}

function startTipsRotation() {
  if (tipInterval) clearInterval(tipInterval);
  const tips = TIPS[currentLang] || TIPS.en;
  tipIndex = 0;
  const el = document.getElementById('tip-text');
  if (!el) return;
  el.textContent = tips[tipIndex];
  tipInterval = setInterval(() => {
    tipIndex = (tipIndex + 1) % tips.length;
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = tips[tipIndex];
      el.style.opacity = '1';
    }, 300);
  }, 8000);
}

// Initialize language on load
function initI18n() {
  setLanguage(currentLang);
  startTipsRotation();
}
