import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './DigitalLedger.css';
import api from '../utils/apiService';

export default function DigitalLedger({ lang: propL = 'mr', onNavigate, profile }) {
  const [L, setL] = useState(propL);
  useEffect(() => { setL(propL); }, [propL]);

  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('agro_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  const userId = profile?._id || profile?.id || 'guest';
  
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem(`agro_ult_expenses_${userId}`) || '[]'));
  const [income, setIncome] = useState(() => JSON.parse(localStorage.getItem(`agro_ult_income_${userId}`) || '[]'));
  const [myFields, setMyFields] = useState(() => JSON.parse(localStorage.getItem(`agro_ult_fields_${userId}`) || '[]'));

  // When user changes, reload their specific local data
  useEffect(() => {
    setExpenses(JSON.parse(localStorage.getItem(`agro_ult_expenses_${userId}`) || '[]'));
    setIncome(JSON.parse(localStorage.getItem(`agro_ult_income_${userId}`) || '[]'));
    setMyFields(JSON.parse(localStorage.getItem(`agro_ult_fields_${userId}`) || '[]'));
  }, [userId]);

  useEffect(() => {
    // Splash screen delay
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          const fieldsRes = await api.getFields(token);
          const recordsRes = await api.getRecords(token);
          if (!fieldsRes.error && Array.isArray(fieldsRes)) setMyFields(fieldsRes.map(f => ({ ...f, id: f._id || f.id })));
          if (!recordsRes.error && Array.isArray(recordsRes)) {
            const mapped = recordsRes.map(r => ({ ...r, id: r._id || r.id }));
            setExpenses(mapped.filter(r => r.type === 'expense'));
            setIncome(mapped.filter(r => r.type === 'income'));
          }
        } catch(e) { console.error(e); }
      };
      fetchData();
    }
  }, [token]);

  useEffect(() => {
    if (!token && userId) {
      localStorage.setItem(`agro_ult_expenses_${userId}`, JSON.stringify(expenses));
      localStorage.setItem(`agro_ult_income_${userId}`, JSON.stringify(income));
      localStorage.setItem(`agro_ult_fields_${userId}`, JSON.stringify(myFields));
    }
  }, [expenses, income, myFields, token, userId]);

  const analytics = useMemo(() => {
    const te = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const ti = income.reduce((s, i) => s + Number(i.amount || 0), 0);
    const catMap = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
      return acc;
    }, {});
    const pieData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] }));
    return { te, ti, pieData };
  }, [expenses, income]);

  const TArr = {
    mr: {
      brand: "अ‍ॅग्रो मास्टर", tag: "शेतकरी मित्र",
      home: "होम", ledger: "शेतीचा जमाखर्च", fields: "माझे क्षेत्र (पिकाची नोंद)", reports: "अहवाल",
      totalExp: "एकूण खर्च", totalInc: "एकूण उत्पन्न",
      save: "जतन करा", field: "कोणते पीक / क्षेत्र?", cat: "खर्च प्रकार", 
      labor: "मजूर", tractor: "ट्रॅक्टर", fert: "खते/बियाणे", other: "इतर / इतर खर्च", back: "मागे जा"
    },
    en: {
      brand: "Agro Master", tag: "Farmer's Friend",
      home: "Home", ledger: "Farm Accounting", fields: "My Fields", reports: "Reports",
      totalExp: "Total Exp", totalInc: "Total Inc",
      save: "Save", field: "Select Crop / Field", cat: "Category", 
      labor: "Labor", tractor: "Tractor", fert: "Fertilizer/Seeds", other: "Other / Misc", back: "Back"
    }
  };
  const T = TArr[L];

  if (isLoading) {
    return (
      <div className="dl-splash">
        <div className="dl-splash-content">
          <div className="dl-splash-logo">🌱</div>
          <h1>{TArr[propL].brand}</h1>
          <div className="dl-loader-bar"><div className="dl-loader-progress"></div></div>
          <p>{L === 'mr' ? 'तुमच्या शेतीचा डिजिटल सोबती...' : 'Your digital farming companion...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dl-canvas ${L}`}>
      <header className="dl-topbar">
        <div className="dl-top-left">
          <button className="dl-hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
          <div className="dl-brand" onClick={() => setActiveTab('home')} style={{cursor: 'pointer'}}>
            <div className="dl-logo-box">🌱</div>
            <div>
              <h1>{T.brand}</h1>
              <span>{T.tag}</span>
            </div>
          </div>
        </div>
        <div className="dl-top-right">
          <div className="dl-lang-toggle">
            <button className={L === 'mr' ? 'active' : ''} onClick={() => setL('mr')}>MR</button>
            <button className={L === 'en' ? 'active' : ''} onClick={() => setL('en')}>EN</button>
          </div>
          <button className="dl-back-btn" onClick={() => onNavigate('home')}>⬅️ {T.back}</button>
        </div>
      </header>

      <div className="dl-body">
        <aside className={`dl-sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
          <nav className="dl-nav">
            <button className={`dl-nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }}>🏠 {T.home}</button>
            <button className={`dl-nav-link ${activeTab === 'fields' ? 'active' : ''}`} onClick={() => { setActiveTab('fields'); setIsSidebarOpen(false); }}>🌱 {T.fields}</button>
            <button className={`dl-nav-link ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => { setActiveTab('ledger'); setIsSidebarOpen(false); }}>📒 {T.ledger}</button>
            <button className={`dl-nav-link ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => { setActiveTab('reports'); setIsSidebarOpen(false); }}>📈 {T.reports}</button>
          </nav>
        </aside>

        <main className="dl-main">
          <div className="dl-header-title animate-in">
            <div style={{display:'flex', flexDirection:'column'}}>
              <h2>
                {activeTab === 'home' ? T.home : activeTab === 'ledger' ? T.ledger : activeTab === 'fields' ? T.fields : T.reports}
              </h2>
              {token && <span style={{fontSize:'0.8rem', color:'var(--dl-text-muted)', fontWeight:700}}>👤 {JSON.parse(localStorage.getItem('agro_profile') || '{}').name}</span>}
            </div>
            <div className={`dl-status-badge ${token ? 'online' : 'offline'}`}>
              <span className="dl-status-dot"></span>
              {token ? (L === 'mr' ? 'क्लाउड कनेक्टेड (MongoDB)' : 'Cloud Connected') : (L === 'mr' ? 'लोकल मोड (Offline)' : 'Local Mode')}
            </div>
          </div>

          <div className="dl-content-area animate-in" style={{animationDelay: '0.1s'}}>
            {activeTab === 'home' && <HomeView T={T} L={L} fields={myFields} expenses={expenses} income={income} onTabChange={setActiveTab} />}
            {activeTab === 'ledger' && <FarmAccountingView T={T} expenses={expenses} income={income} setExpenses={setExpenses} setIncome={setIncome} fields={myFields} L={L} onTabChange={setActiveTab} token={token} />}
            {activeTab === 'fields' && <FieldView T={T} fields={myFields} setFields={setMyFields} L={L} token={token} />}
            {activeTab === 'reports' && <ReportsView T={T} analytics={analytics} L={L} />}
          </div>
        </main>
      </div>

      {/* IMPROVED PREMIUM FOOTER */}
      <footer className="dl-final-footer">
        <div className="footer-top">
          <div className="footer-col-brand">
            <div className="f-logo">🌱 AgroMaster</div>
            <p>{L === 'mr' ? 'आधुनिक शेतीचे प्रगत तंत्रज्ञान. आता हिशोब ठेवा चुटकीसरशी.' : 'Advanced technology for modern farming. Manage accounts with ease.'}</p>
            <div className="f-socials">
              <span>🌐</span> <span>📱</span> <span>✉️</span>
            </div>
          </div>
          <div className="footer-col">
            <h4>{L === 'mr' ? 'सेवा' : 'Services'}</h4>
            <ul>
              <li>{L === 'mr' ? 'जमाखर्च' : 'Accounting'}</li>
              <li>{L === 'mr' ? 'पीक सल्ला' : 'Crop Advice'}</li>
              <li>{L === 'mr' ? 'बाजार भाव' : 'Mandi Rates'}</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{L === 'mr' ? 'मदत' : 'Support'}</h4>
            <ul>
              <li onClick={() => setShowSupport(true)}>{L === 'mr' ? 'संपर्क' : 'Contact'}</li>
              <li onClick={() => setShowSupport(true)}>{L === 'mr' ? 'प्रायव्हसी' : 'Privacy'}</li>
              <li onClick={() => setShowSupport(true)}>{L === 'mr' ? 'नियम' : 'Terms'}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 AgroMaster India. {L === 'mr' ? 'सर्व हक्क राखीव.' : 'All Rights Reserved.'}</p>
          <div className="f-badges">
            <span>🇮🇳 Made for India</span>
          </div>
        </div>
      </footer>

      {/* SUPPORT MODAL */}
      {showSupport && (
        <div className="dl-modal-overlay animate-in" onClick={() => setShowSupport(false)}>
          <div className="dl-modal-content support-modal" onClick={e => e.stopPropagation()}>
            <button className="dl-modal-close" onClick={() => setShowSupport(false)}>✕</button>
            <div className="support-modal-header">
              <h2>{L === 'mr' ? 'कसे मदत करू शकतो?' : 'How can we help?'}</h2>
              <p>{L === 'mr' ? 'आमची टीम तुमच्या सेवेसाठी सज्ज आहे.' : 'Our team is here to support you.'}</p>
            </div>
            <div className="support-grid">
              <div className="support-card">
                <span className="s-icon">📞</span>
                <h4>{L === 'mr' ? 'कॉल करा' : 'Call Us'}</h4>
                <p>+91 98765 43210</p>
              </div>
              <div className="support-card">
                <span className="s-icon">📧</span>
                <h4>{L === 'mr' ? 'ईमेल' : 'Email'}</h4>
                <p>support@agromaster.in</p>
              </div>
              <div className="support-card">
                <span className="s-icon">📍</span>
                <h4>{L === 'mr' ? 'पत्ता' : 'Office'}</h4>
                <p>{L === 'mr' ? 'पुणे, महाराष्ट्र' : 'Pune, Maharashtra'}</p>
              </div>
            </div>
            <div className="support-form">
              <h3>{L === 'mr' ? 'संदेश पाठवा' : 'Send a Message'}</h3>
              <input type="text" placeholder={L === 'mr' ? 'तुमचे नाव' : 'Your Name'} className="dl-input" />
              <textarea placeholder={L === 'mr' ? 'तुमचा प्रश्न...' : 'Your query...'} className="dl-input"></textarea>
              <button className="dl-btn-submit" onClick={() => { alert(L === 'mr' ? 'संदेश पाठवला!' : 'Message Sent!'); setShowSupport(false); }}>
                {L === 'mr' ? 'पाठवा' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeView({ T, L, fields, expenses, income, onTabChange }) {
  const [selectedCare, setSelectedCare] = useState(null);
  const [memo, setMemo] = useState(localStorage.getItem('agro_memo') || '');
  const [weather, setWeather] = useState({ temp: 32, humidity: 45, wind: 12, city: 'Pune' });

  useEffect(() => {
    const fetchWeather = async () => {
      const data = await api.getWeather('Pune'); // Can be dynamic based on profile
      if (!data.error && data.temp !== undefined) {
        setWeather(data);
      }
    };
    fetchWeather();
  }, []);

  const totalBalance = useMemo(() => {
    const exp = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const inc = income.reduce((s, i) => s + Number(i.amount || 0), 0);
    return inc - exp;
  }, [expenses, income]);

  const recentActivity = useMemo(() => {
    const all = [
      ...expenses.map(e => ({ ...e, type: 'exp' })),
      ...income.map(i => ({ ...i, type: 'inc' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    return all.slice(0, 3);
  }, [expenses, income]);

  const saveMemo = (val) => {
    setMemo(val);
    localStorage.setItem('agro_memo', val);
  };

  const careTips = {
    soil: {
      title: L === 'mr' ? 'माती परीक्षण (Soil Testing)' : 'Soil Testing',
      img: "https://images.unsplash.com/photo-1592982537447-6f23f66904bc?q=80&w=600&auto=format&fit=crop",
      tips: L === 'mr' ? [
        'पिकाला आवश्यक खतांची मात्रा ठरवण्यासाठी माती परीक्षण गरजेचे आहे.',
        'शेताच्या ५-६ ठिकाणची माती एकत्र करून नमुना घ्यावा.',
        'PH आणि सेंद्रिय कर्ब तपासणे महत्त्वाचे आहे.'
      ] : [
        'Soil testing is essential for accurate fertilization.',
        'Collect soil from 5-6 different spots and mix.',
        'Checking PH and Organic Carbon is crucial.'
      ]
    },
    pest: {
      title: L === 'mr' ? 'कीड नियंत्रण (Pest Control)' : 'Pest Control',
      img: "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=600&auto=format&fit=crop",
      tips: L === 'mr' ? [
        'कीड ओळखणे हे नियंत्रणातील पहिले पाऊल आहे.',
        'जैविक कीडनाशकांचा वापर वाढवावा.',
        'कामगंध सापळे शेतात लावावेत.'
      ] : [
        'Identify the pest first before treating.',
        'Prioritize bio-pesticides for safety.',
        'Use pheromone traps for monitoring.'
      ]
    },
    irrigation: {
      title: L === 'mr' ? 'पाणी व्यवस्थापन (Irrigation)' : 'Irrigation',
      img: "https://images.unsplash.com/photo-1463123081488-789f99829c4d?q=80&w=600&auto=format&fit=crop",
      tips: L === 'mr' ? [
        'ठिबक सिंचनाचा वापर करून पाण्याची ६०% बचत करा.',
        'पिकाच्या वाढीच्या अवस्थेनुसार पाणी द्यावे.',
        'सकाळी किंवा संध्याकाळी पाणी देणे अधिक फायदेशीर.'
      ] : [
        'Save 60% water using drip irrigation.',
        'Water based on the crop growth stage.',
        'Watering in cool hours reduces evaporation.'
      ]
    }
  };

  const getProfileName = () => {
    try {
      const p = localStorage.getItem('agro_profile');
      if (!p || p === 'undefined') return '';
      return JSON.parse(p).name || '';
    } catch (e) { return ''; }
  };

  return (
    <div className="dl-home-guide animate-in">
      <div className="dl-home-hero">
        <div className="dl-hero-bg-pattern"></div>
        <div className="dl-hero-content">
          <div className="dl-hero-text">
            <h2>{L === 'mr' ? `शुभ दिन, ${getProfileName() || 'शेतकरी मित्र'}! 👋` : `Good Day, ${getProfileName() || 'Farmer'}! 👋`}</h2>
            <p>
              {L === 'mr' 
                ? 'तुमच्या शेतीचा हिशोब आता डिजिटल आणि सुरक्षित. प्रगतीशील शेतकरी, प्रगत शेती!' 
                : 'Your farm accounting is now digital and secure. Empowering modern agriculture.'}
            </p>
          </div>
          <div className="dl-hero-visual">🚜</div>
        </div>
      </div>

      <div className="dl-main-grid">
        <div className="dl-left-col">
          <div className="dl-stats-grid">
            <div className="dl-stat-card">
              <div className="dl-stat-icon" style={{background: 'rgba(16, 185, 129, 0.1)', color: 'var(--dl-emerald)'}}>🌱</div>
              <div>
                <h4>{L === 'mr' ? 'नोंदवलेली पिके' : 'Active Crops'}</h4>
                <span>{fields.length}</span>
              </div>
            </div>
            <div className="dl-stat-card" onClick={() => onTabChange('ledger')} style={{cursor:'pointer', position:'relative'}}>
              <div className="dl-stat-icon" style={{background: 'rgba(99, 102, 241, 0.1)', color: 'var(--dl-indigo)'}}>📒</div>
              <div style={{flex: 1}}>
                <h4 style={{fontSize:'0.9rem', color:'var(--dl-text-muted)'}}>{L === 'mr' ? 'एकूण शिल्लक' : 'Net Balance'}</h4>
                <div style={{display:'flex', alignItems:'baseline', gap:'10px'}}>
                  <span style={{fontSize:'1.8rem', fontWeight:950, color: totalBalance >= 0 ? 'var(--dl-emerald)' : 'var(--dl-rose)'}}>₹{totalBalance.toLocaleString()}</span>
                </div>
                <div style={{marginTop:'8px', display:'flex', gap:'15px', borderTop:'1px solid var(--dl-border)', paddingTop:'8px'}}>
                  <div>
                    <p style={{fontSize:'0.7rem', color:'var(--dl-text-muted)', fontWeight:700}}>{L==='mr'?'एकूण उत्पन्न':'Total Income'}</p>
                    <span style={{fontSize:'0.9rem', fontWeight:800, color:'var(--dl-emerald)'}}>+₹{income.reduce((s,i)=>s+Number(i.amount||0),0).toLocaleString()}</span>
                  </div>
                  <div>
                    <p style={{fontSize:'0.7rem', color:'var(--dl-text-muted)', fontWeight:700}}>{L==='mr'?'एकूण खर्च':'Total Expense'}</p>
                    <span style={{fontSize:'0.9rem', fontWeight:800, color:'var(--dl-rose)'}}>-₹{expenses.reduce((s,e)=>s+Number(e.amount||0),0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div style={{position:'absolute', top:'15px', right:'15px', fontSize:'0.7rem', color:'var(--dl-indigo)', fontWeight:800}}>DETAILS ➜</div>
            </div>
          </div>

          {/* NEW CLASSY FEATURE: WEATHER & ENV */}
          <div className="dl-env-widget animate-in" style={{animationDelay: '0.2s'}}>
            <div className="env-item">
              <span className="env-icon">☀️</span>
              <div className="env-info">
                <label>{L === 'mr' ? 'तापमान' : 'Temp'} ({weather.city})</label>
                <span>{weather.temp}°C</span>
              </div>
            </div>
            <div className="env-item">
              <span className="env-icon">💧</span>
              <div className="env-info">
                <label>{L === 'mr' ? 'आर्द्रता' : 'Humidity'}</label>
                <span>{weather.humidity}%</span>
              </div>
            </div>
            <div className="env-item">
              <span className="env-icon">🌬️</span>
              <div className="env-info">
                <label>{L === 'mr' ? 'वारा' : 'Wind'}</label>
                <span>{weather.wind} km/h</span>
              </div>
            </div>
          </div>

          <h3 className="dl-section-title">{L === 'mr' ? 'हंगाम मार्गदर्शक' : 'Season Guide'}</h3>
          <div className="dl-season-card">
            <div className="dl-season-month">
              <span className="dl-month-tag">{new Date().toLocaleString(L === 'mr' ? 'mr-IN' : 'en-US', { month: 'long' })}</span>
              <h4>{L === 'mr' ? 'चालू कामे (On-going Tasks)' : 'Current Tasks'}</h4>
            </div>
            <div className="dl-season-tasks">
              <div className="dl-s-task">🚜 {L === 'mr' ? 'पूर्वमशागत करा' : 'Primary Tillage'}</div>
              <div className="dl-s-task">🧪 {L === 'mr' ? 'खत मात्रा नियोजन' : 'Fertilizer Planning'}</div>
              <div className="dl-s-task">💧 {L === 'mr' ? 'ठिबक संच तपासा' : 'Check Drip System'}</div>
            </div>
          </div>

          <h3 className="dl-section-title">{L === 'mr' ? 'क्विक ॲक्शन्स' : 'Quick Actions'}</h3>
          <div className="dl-actions-grid">
            <div className="dl-action-btn" onClick={() => onTabChange('fields')}>
              <div className="dl-action-icon">🏡</div>
              <span>{L === 'mr' ? 'नवीन पीक' : 'New Crop'}</span>
            </div>
            <div className="dl-action-btn" onClick={() => onTabChange('ledger')}>
              <div className="dl-action-icon">🧑‍🌾</div>
              <span>{L === 'mr' ? 'मजुरी' : 'Labor'}</span>
            </div>
            <div className="dl-action-btn" onClick={() => onTabChange('ledger')}>
              <div className="dl-action-icon">🧪</div>
              <span>{L === 'mr' ? 'खर्च' : 'Expense'}</span>
            </div>
            <div className="dl-action-btn" onClick={() => onTabChange('reports')}>
              <div className="dl-action-icon">📈</div>
              <span>{L === 'mr' ? 'अहवाल' : 'Reports'}</span>
            </div>
          </div>
        </div>

        <aside className="dl-right-col">
          {/* ALERT WIDGET */}
          <div className="dl-alert-box">
            <div className="dl-alert-header">
              <span className="dl-alert-icon">⚠️</span>
              <h4>{L === 'mr' ? 'महत्त्वाची सूचना' : 'Local Alerts'}</h4>
            </div>
            <p>{L === 'mr' ? 'तुमच्या भागात पुढच्या ४८ तासांत पावसाची शक्यता आहे. काढणी केलेल्या पिकांची सुरक्षित साठवणूक करा.' : 'High chance of rain in the next 48 hours. Secure your harvested crops.'}</p>
          </div>

          {/* QUICK MEMO */}
          <div className="dl-memo-box">
            <h4>{L === 'mr' ? 'माझी छोटी नोंद (Memo)' : 'Quick Memo'}</h4>
            <textarea 
              placeholder={L === 'mr' ? 'येथे काहीतरी लिहा...' : 'Type something here...'}
              value={memo}
              onChange={(e) => saveMemo(e.target.value)}
            />
          </div>

          {/* RECENT ACTIVITY */}
          <div className="dl-activity-box">
            <h4>{L === 'mr' ? 'अलीकडील हालचाली' : 'Recent Activity'}</h4>
            <div className="dl-activity-list">
              {recentActivity.length > 0 ? recentActivity.map((a, i) => (
                <div key={i} className="dl-activity-item">
                  <div className={`dl-act-dot ${a.type}`}></div>
                  <div className="dl-act-info">
                    <p>{a.category || a.incomeType || 'Transaction'}</p>
                    <span>{a.date}</span>
                  </div>
                  <div className={`dl-act-amt ${a.type}`}>{a.type === 'inc' ? '+' : '-'}₹{Number(a.amount).toLocaleString()}</div>
                </div>
              )) : <p style={{padding:'20px', textAlign:'center', color:'var(--dl-text-muted)'}}>{L==='mr'?'नोंदी नाहीत':'No activities yet'}</p>}
            </div>
          </div>
        </aside>
      </div>

      <h3 className="dl-section-title">{L === 'mr' ? 'पीक निगा केंद्र' : 'Crop Care Center'}</h3>
      <div className="dl-care-grid">
        <div className="dl-care-card soil-card" onClick={() => setSelectedCare('soil')}>
          <img src={careTips.soil.img} alt="Soil" />
          <div className="dl-care-overlay">
            <h4>{careTips.soil.title}</h4>
            <p>{L === 'mr' ? 'माती परीक्षण टिप्स' : 'Soil Testing Tips'}</p>
          </div>
        </div>
        <div className="dl-care-card pest-card" onClick={() => setSelectedCare('pest')}>
          <img src={careTips.pest.img} alt="Pest" />
          <div className="dl-care-overlay">
            <h4>{careTips.pest.title}</h4>
            <p>{L === 'mr' ? 'कीड नियंत्रण टिप्स' : 'Pest Control Tips'}</p>
          </div>
        </div>
        <div className="dl-care-card irrigation-card" onClick={() => setSelectedCare('irrigation')}>
          <img src={careTips.irrigation.img} alt="Irrigation" />
          <div className="dl-care-overlay">
            <h4>{careTips.irrigation.title}</h4>
            <p>{L === 'mr' ? 'पाणी व्यवस्थापन टिप्स' : 'Irrigation Tips'}</p>
          </div>
        </div>
      </div>

      {selectedCare && (
        <div className="dl-modal-overlay animate-in" onClick={() => setSelectedCare(null)}>
          <div className="dl-modal-content care-modal" onClick={e => e.stopPropagation()}>
            <button className="dl-modal-close" onClick={() => setSelectedCare(null)}>✕</button>
            <div className="care-modal-body">
              <div className={`care-modal-img-wrap ${selectedCare}-card-wrap`}>
                <img src={careTips[selectedCare].img} alt={selectedCare} className="care-modal-img" />
              </div>
              <div className="care-modal-info">
                <h3 style={{color: selectedCare === 'pest' ? 'var(--dl-rose)' : selectedCare === 'irrigation' ? 'var(--dl-indigo)' : 'var(--dl-emerald)'}}>
                  {careTips[selectedCare].title}
                </h3>
                <ul className="care-tips-list">
                  {careTips[selectedCare].tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function FarmAccountingView({ T, expenses, income, setExpenses, setIncome, fields, L, onTabChange, token }) {
  const [mainType, setMainType] = useState('new_expense');
  const [expCat, setExpCat] = useState('labor');
  const [customCat, setCustomCat] = useState(''); // For 'Other'
  const [fId, setFId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [lWorkers, setLWorkers] = useState('');
  const [lWage, setLWage] = useState('');
  const [lTask, setLTask] = useState('');
  
  const [tHours, setTHours] = useState('');
  const [tRate, setTRate] = useState('');
  const [tTask, setTTask] = useState('');

  const [fsShop, setFsShop] = useState('');
  const [fsProduct, setFsProduct] = useState('');
  const [fsQty, setFsQty] = useState('');
  const [fsAmount, setFsAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const fileInputRef = useRef(null);

  const [iType, setIType] = useState('Crop Sale'); // Income Type
  const [iBuyer, setIBuyer] = useState('');
  const [iQty, setIQty] = useState('');
  const [iRate, setIRate] = useState('');

  const [selectedCropField, setSelectedCropField] = useState(null);

  if (fields.length === 0) {
    return (
      <div className="dl-card" style={{textAlign: 'center', padding: '50px 20px'}}>
        <h3 style={{fontSize: '2rem', marginBottom: '20px'}}>⚠️ {L==='mr'?'कोणतेही पीक नोंदवलेले नाही!':'No Crops Registered!'}</h3>
        <p style={{color: 'var(--dl-text-muted)', marginBottom: '30px', fontSize: '1.1rem'}}>
          {L==='mr'?'खर्चाची नोंद करण्यापूर्वी तुम्हाला तुमचे पीक आणि क्षेत्र नोंदवणे आवश्यक आहे.':'Before logging expenses, you need to register your crop and field.'}
        </p>
        <button className="dl-btn-submit" onClick={() => onTabChange('fields')} style={{padding: '15px 40px'}}>
          {L==='mr'?'पिकाची नोंदणी करा':'Register Crop'}
        </button>
      </div>
    );
  }

  const saveExpense = async () => {
    if (!fId) return alert(L==='mr'?"कृपया पीक निवडा!":"Select a crop!");
    let amt = 0;
    let note = '';
    let finalCat = expCat;
    
    if (expCat === 'labor') {
      amt = Number(lWorkers) * Number(lWage);
      note = `${lWorkers} मजूर @ ₹${lWage} - ${lTask}`;
      if(!lWorkers || !lWage) return alert(L==='mr'?'मजूर व मजुरी भरा':'Fill workers and wage');
    } else if (expCat === 'tractor') {
      amt = Number(tHours) * Number(tRate);
      note = `${tHours} तास @ ₹${tRate} - ${tTask}`;
      if(!tHours || !tRate) return alert(L==='mr'?'तास व दर भरा':'Fill hours and rate');
    } else if (expCat === 'fert') {
      amt = Number(fsAmount);
      note = `${fsQty} ${fsProduct} (${fsShop})`;
      if(!fsAmount) return alert(L==='mr'?'रक्कम भरा':'Fill amount');
    } else if (expCat === 'other') {
      amt = Number(fsAmount);
      note = `${customCat}: ${fsProduct}`;
      finalCat = customCat || 'Other';
      if(!fsAmount) return alert(L==='mr'?'रक्कम भरा':'Fill amount');
    }

    let finalReceiptName = null;
    if (receiptFile && token) {
      const uploadRes = await api.uploadReceipt(token, receiptFile);
      if (uploadRes.filename) {
        finalReceiptName = uploadRes.filename;
      }
    }

    const entry = { type: 'expense', fieldId: fId, date, category: finalCat, amount: amt, note, receipt: finalReceiptName };
    
    if (token) {
      const res = await api.addRecord(token, entry);
      if (!res.error) {
        setExpenses([{ ...res, id: res._id || res.id }, ...expenses]);
      } else {
        alert('Error: ' + res.error);
        return;
      }
    } else {
      setExpenses([{ id: Date.now(), ...entry }, ...expenses]);
    }
    
    setLWorkers(''); setLWage(''); setLTask('');
    setTHours(''); setTRate(''); setTTask('');
    setFsShop(''); setFsProduct(''); setFsQty(''); setFsAmount(''); setReceiptFile(null);
    setCustomCat('');
    alert(L==='mr'?"✅ खर्च जतन झाला! (Photo Uploaded)":"✅ Expense Saved! (Photo Uploaded)");
  };

  const saveIncome = async () => {
    if (!fId || !iQty || !iRate) return alert(L==='mr'?"सर्व माहिती भरा!":"Fill all fields!");
    const amt = Number(iQty) * Number(iRate);

    let finalReceiptName = null;
    if (receiptFile && token) {
      const uploadRes = await api.uploadReceipt(token, receiptFile);
      if (uploadRes.filename) {
        finalReceiptName = uploadRes.filename;
      }
    }

    const entry = { type: 'income', fieldId: fId, date, amount: amt, note: `${iType}: ${iQty} Quintals @ ₹${iRate} (${iBuyer})`, buyer: iBuyer, incomeType: iType, category: iType, receipt: finalReceiptName };
    
    if (token) {
      const res = await api.addRecord(token, entry);
      if (!res.error) {
        setIncome([{ ...res, id: res._id || res.id }, ...income]);
      } else {
        alert('Error: ' + res.error);
        return;
      }
    } else {
      setIncome([{ id: Date.now(), ...entry }, ...income]);
    }

    setIBuyer(''); setIQty(''); setIRate(''); setReceiptFile(null);
    alert(L==='mr'?"✅ उत्पन्न जतन झाले! (Photo Uploaded)":"✅ Income Saved! (Photo Uploaded)");
  };

  const getCropTotal = (fieldId) => {
    return expenses.filter(e => e.fieldId === fieldId).reduce((s, e) => s + Number(e.amount), 0);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
      alert(L==='mr'?`पावती जोडली: ${e.target.files[0].name}`:`Receipt attached: ${e.target.files[0].name}`);
    }
  };

  const handleDeleteRecord = async (id, type) => {
    if (!window.confirm(L === 'mr' ? 'ही नोंद हटवायची आहे का?' : 'Delete this record?')) return;
    if (token) {
      const res = await api.deleteRecord(token, id);
      if (res.error) return alert(res.error);
    }
    if (type === 'expense') setExpenses(expenses.filter(e => (e.id !== id && e._id !== id)));
    else setIncome(income.filter(i => (i.id !== id && i._id !== id)));
    alert(L === 'mr' ? 'नोंद हटवली!' : 'Record deleted!');
  };

  return (
    <div>
      <div className="dl-type-toggle">
        <button className={`dl-type-btn expense ${mainType === 'new_expense' ? 'active' : ''}`} onClick={() => setMainType('new_expense')}>📉 {L === 'mr' ? 'खर्चाची नोंद' : 'Log Expense'}</button>
        <button className={`dl-type-btn income ${mainType === 'new_income' ? 'active' : ''}`} onClick={() => setMainType('new_income')}>📈 {L === 'mr' ? 'उत्पन्नाची नोंद' : 'Log Income'}</button>
        <button className={`dl-type-btn ${mainType === 'recent_records' ? 'active' : ''}`} style={{color: mainType==='recent_records'?'white':'var(--dl-text-muted)', background: mainType==='recent_records'?'var(--dl-indigo)':'transparent'}} onClick={() => setMainType('recent_records')}>📒 {L === 'mr' ? 'अलीकडील नोंदी' : 'Recent Records'}</button>
      </div>

      <div className="dl-card">
        {mainType === 'new_expense' && (
          <>
            <div className="dl-exp-cats" style={{display:'flex', gap:'10px', marginBottom:'30px', flexWrap:'wrap'}}>
              {[{id:'labor',n:T.labor,i:'🧑‍🌾'},{id:'tractor',n:T.tractor,i:'🚜'},{id:'fert',n:T.fert,i:'🧪'},{id:'other',n:T.other,i:'📦'}].map(c => (
                <button key={c.id} style={{padding:'12px 20px', borderRadius:'12px', border:'1px solid var(--dl-border)', background: expCat===c.id?'var(--dl-emerald)':'white', color: expCat===c.id?'white':'var(--dl-text-muted)', cursor:'pointer', fontWeight:800}} onClick={()=>setExpCat(c.id)}>
                  {c.i} {c.n}
                </button>
              ))}
            </div>

            <div className="dl-form-grid">
              <div className="dl-input-group full">
                <label>{T.field} *</label>
                <select className="dl-input" value={fId} onChange={e => setFId(e.target.value)}>
                  <option value="">-- {L==='mr'?'पीक निवडा':'Select Crop'} --</option>
                  {fields.map(f => <option key={f.id} value={f.id}>{f.crop} ({f.name})</option>)}
                </select>
              </div>

              {expCat === 'other' && (
                <div className="dl-input-group full">
                  <label>{L==='mr'?'खर्चाचा प्रकार सांगा (उदा. औषधे, विमा)':'Specify Expense Type (e.g. Pesticide, Insurance)'}</label>
                  <input className="dl-input" placeholder="उदा. औषधे" value={customCat} onChange={e=>setCustomCat(e.target.value)} />
                </div>
              )}

              {expCat === 'labor' && (
                <>
                  <div className="dl-input-group"><label>{L==='mr'?'मजूर संख्या':'No. of Workers'}</label><input className="dl-input" type="number" value={lWorkers} onChange={e=>setLWorkers(e.target.value)}/></div>
                  <div className="dl-input-group"><label>{L==='mr'?'मजुरी (₹)':'Wage (₹)'}</label><input className="dl-input" type="number" value={lWage} onChange={e=>setLWage(e.target.value)}/></div>
                  <div className="dl-input-group full"><label>{L==='mr'?'कामाचा प्रकार':'Task'}</label><input className="dl-input" value={lTask} onChange={e=>setLTask(e.target.value)}/></div>
                  {lWorkers && lWage && (
                    <div className="dl-calc-preview animate-in full" style={{background: 'rgba(16, 185, 129, 0.05)', padding: '15px', borderRadius: '12px', border: '1px dashed var(--dl-emerald)', color: 'var(--dl-emerald)', fontWeight: 800, textAlign: 'center', marginBottom: '15px'}}>
                      🔢 {L==='mr'?'हिशोब':'Calculation'}: {lWorkers} {L==='mr'?'मजूर':'Workers'} × ₹{lWage} = <span style={{fontSize: '1.2rem'}}>₹{(Number(lWorkers) * Number(lWage)).toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}

              {expCat === 'tractor' && (
                <>
                  <div className="dl-input-group"><label>{L==='mr'?'तास':'Hours'}</label><input className="dl-input" type="number" value={tHours} onChange={e=>setTHours(e.target.value)}/></div>
                  <div className="dl-input-group"><label>{L==='mr'?'दर (₹)':'Rate (₹)'}</label><input className="dl-input" type="number" value={tRate} onChange={e=>setTRate(e.target.value)}/></div>
                  <div className="dl-input-group full"><label>{L==='mr'?'कामाचा प्रकार':'Task'}</label><input className="dl-input" value={tTask} onChange={e=>setTTask(e.target.value)}/></div>
                  {tHours && tRate && (
                    <div className="dl-calc-preview animate-in full" style={{background: 'rgba(99, 102, 241, 0.05)', padding: '15px', borderRadius: '12px', border: '1px dashed var(--dl-indigo)', color: 'var(--dl-indigo)', fontWeight: 800, textAlign: 'center', marginBottom: '15px'}}>
                      🔢 {L==='mr'?'हिशोब':'Calculation'}: {tHours} {L==='mr'?'तास':'Hours'} × ₹{tRate} = <span style={{fontSize: '1.2rem'}}>₹{(Number(tHours) * Number(tRate)).toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}

              {(expCat === 'fert' || expCat === 'other') && (
                <>
                  {expCat === 'fert' && <div className="dl-input-group"><label>{L==='mr'?'दुकानाचे नाव':'Shop Name'}</label><input className="dl-input" value={fsShop} onChange={e=>setFsShop(e.target.value)}/></div>}
                  <div className="dl-input-group"><label>{L==='mr'?'प्रॉडक्ट/तपशील':'Product/Detail'}</label><input className="dl-input" value={fsProduct} onChange={e=>setFsProduct(e.target.value)}/></div>
                  <div className="dl-input-group"><label>{L==='mr'?'रक्कम (₹)':'Amount (₹)'}</label><input className="dl-input" type="number" value={fsAmount} onChange={e=>setFsAmount(e.target.value)}/></div>
                  <div className="dl-input-group full">
                    <label>{L==='mr'?'पावती':'Receipt'}</label>
                    <button className="dl-upload-btn" onClick={() => fileInputRef.current.click()}>📷 {receiptFile ? receiptFile.name : (L==='mr'?'अपलोड करा':'Upload')}</button>
                    <input type="file" accept="image/*" capture="environment" className="dl-file-input" ref={fileInputRef} onChange={handleFileUpload} />
                  </div>
                </>
              )}

              <div className="dl-input-group full"><label>{L==='mr'?'दिनांक':'Date'}</label><input className="dl-input" type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
              <button className="dl-btn-submit expense-btn full" onClick={saveExpense}>💾 {L==='mr'?'जतन करा':'Save'}</button>
            </div>
          </>
        )}

        {mainType === 'new_income' && (
          <div className="dl-form-grid">
            <div className="dl-input-group full">
              <label>{T.field} *</label>
              <select className="dl-input" value={fId} onChange={e => setFId(e.target.value)}>
                <option value="">-- {L==='mr'?'पीक निवडा':'Select Crop'} --</option>
                {fields.map(f => <option key={f.id} value={f.id}>{f.crop} ({f.name})</option>)}
              </select>
            </div>
            <div className="dl-input-group full">
              <label>{L==='mr'?'उत्पन्नाचा प्रकार':'Income Type'}</label>
              <select className="dl-input" value={iType} onChange={e=>setIType(e.target.value)}>
                <option value="Crop Sale">{L==='mr'?'पीक विक्री':'Crop Sale'}</option>
                <option value="Subsidy">{L==='mr'?'अनुदान':'Subsidy'}</option>
                <option value="Other">{L==='mr'?'इतर':'Other'}</option>
              </select>
            </div>
            <div className="dl-input-group full"><label>{L==='mr'?'व्यापाऱ्याचे नाव / तपशील':'Buyer Name / Detail'}</label><input className="dl-input" value={iBuyer} onChange={e=>setIBuyer(e.target.value)}/></div>
            <div className="dl-input-group"><label>{L==='mr'?'क्विंटल (किंवा नग)':'Quantity'}</label><input className="dl-input" type="number" value={iQty} onChange={e=>setIQty(e.target.value)}/></div>
            <div className="dl-input-group"><label>{L==='mr'?'दर (प्रति युनिट)':'Rate'}</label><input className="dl-input" type="number" value={iRate} onChange={e=>setIRate(e.target.value)}/></div>
            {iQty && iRate && (
              <div className="dl-calc-preview animate-in full" style={{background: 'rgba(16, 185, 129, 0.05)', padding: '15px', borderRadius: '12px', border: '1px dashed var(--dl-emerald)', color: 'var(--dl-emerald)', fontWeight: 800, textAlign: 'center', margin: '15px 0'}}>
                💰 {L==='mr'?'एकूण उत्पन्न':'Total Income'}: {iQty} {L==='mr'?'नग/क्विंटल':'Qty'} × ₹{iRate} = <span style={{fontSize: '1.2rem'}}>₹{(Number(iQty) * Number(iRate)).toLocaleString()}</span>
              </div>
            )}
            <div className="dl-input-group full"><label>{L==='mr'?'दिनांक':'Date'}</label><input className="dl-input" type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
            <button className="dl-btn-submit income-btn full" onClick={saveIncome}>💰 {L==='mr'?'जतन करा':'Save'}</button>
          </div>
        )}

        {mainType === 'recent_records' && (
          <div className="dl-crop-grid">
            {fields.map(f => (
              <div key={f.id} className="dl-crop-square" onClick={() => setSelectedCropField(f)}>
                <div className="dl-crop-icon">{f.crop.includes('Methi') ? '🌿' : '🌱'}</div>
                <h4 className="dl-crop-title">{f.crop}</h4>
                <p className="dl-crop-area">{f.area} Acres</p>
                <div className="dl-crop-total">₹{getCropTotal(f.id).toLocaleString()}</div>
                <p style={{fontSize:'0.8rem', color:'var(--dl-text-muted)', marginTop:'10px'}}>{L==='mr'?'तपशील पहा':'View Details'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCropField && (
        <div className="dl-modal-overlay">
          <div className="dl-modal-content">
            <button className="dl-modal-close" onClick={() => setSelectedCropField(null)}>✖</button>
            <h2 style={{fontSize:'1.8rem', marginBottom:'20px'}}>🌱 {selectedCropField.crop} ({selectedCropField.name})</h2>
            
            <div className="dl-modal-calc" style={{margin: '20px 0', background: 'var(--dl-bg)', padding:'20px', borderRadius:'15px', display:'flex', justifyContent:'space-between'}}>
              <div><h4>{L==='mr'?'एकूण खर्च':'Total Exp'}</h4><span style={{fontSize: '2rem', color: 'var(--dl-rose)', fontWeight:900}}>₹{getCropTotal(selectedCropField.id).toLocaleString()}</span></div>
              <div style={{textAlign:'right'}}><h4>{L==='mr'?'एकूण उत्पन्न':'Total Inc'}</h4><span style={{fontSize: '2rem', color: 'var(--dl-emerald)', fontWeight:900}}>₹{income.filter(i=>i.fieldId===selectedCropField.id).reduce((s,i)=>s+Number(i.amount),0).toLocaleString()}</span></div>
            </div>

            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
              <h3 style={{fontSize:'1.3rem'}}>📜 {L==='mr'?'हिशोब तक्ता':'Account Table'}</h3>
              <button className="dl-btn-secondary" onClick={() => window.print()} style={{padding:'8px 15px', fontSize:'0.9rem', background:'var(--dl-indigo)', color:'white', border:'none', borderRadius:'10px', cursor:'pointer'}}>
                📥 {L==='mr'?'रिपोर्ट डाऊनलोड करा (PDF)':'Download Report'}
              </button>
            </div>

            <div className="dl-table-wrap">
              <table className="dl-table">
                <thead>
                  <tr>
                    <th>{L==='mr'?'दिनांक':'Date'}</th>
                    <th>{L==='mr'?'प्रकार':'Category'}</th>
                    <th>{L==='mr'?'तपशील':'Details'}</th>
                    <th style={{textAlign:'right'}}>{L==='mr'?'रक्कम':'Amount'}</th>
                    <th style={{textAlign:'center'}}>{L==='mr'?'क्रिया':'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.filter(e => e.fieldId === selectedCropField.id).map(r => (
                    <tr key={r.id || r._id}>
                      <td>{r.date}</td>
                      <td>{r.category}</td>
                      <td>
                        {r.note}
                        {r.receipt && (
                          <div style={{marginTop: '10px'}}>
                            <button className="dl-receipt-link" onClick={() => window.open(`http://localhost:5001/uploads/${r.receipt}`, '_blank')}>
                              📎 {L==='mr'?'पावती पहा':'View Receipt'}
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{textAlign:'right'}}>₹{r.amount.toLocaleString()}</td>
                      <td style={{textAlign:'center'}}>
                        <button className="dl-row-delete" onClick={() => handleDeleteRecord(r.id || r._id, 'expense')}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {income.filter(i => i.fieldId === selectedCropField.id).map(r => (
                    <tr key={r.id || r._id}>
                      <td>{r.date}</td>
                      <td>{r.incomeType || 'Income'}</td>
                      <td>
                        {r.note}
                        {r.receipt && (
                          <div style={{marginTop: '10px'}}>
                            <button className="dl-receipt-link" onClick={() => window.open(`http://localhost:5001/uploads/${r.receipt}`, '_blank')}>
                              📎 {L==='mr'?'पावती पहा':'View Receipt'}
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{textAlign:'right', color:'var(--dl-emerald)'}}>+₹{r.amount.toLocaleString()}</td>
                      <td style={{textAlign:'center'}}>
                        <button className="dl-row-delete" onClick={() => handleDeleteRecord(r.id || r._id, 'income')}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldView({ T, fields, setFields, L, token }) {
  const [f, setF] = useState({ name: '', crop: '', customCrop: '', area: '', plantDate: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);

  const cropOptions = ['Soybean', 'Wheat', 'Cotton', 'Onion', 'Methi', 'Sugarcane', 'Jowar', 'Bajra', 'Tur', 'Gram', 'Tomato', 'Other'];

  const add = async () => {
    const cropName = f.crop === 'Other' ? f.customCrop : f.crop;
    if (!cropName || !f.area) return alert(L === 'mr' ? 'पीक आणि क्षेत्र भरा!' : 'Enter crop and area!');
    
    setSaving(true);
    const fieldData = { name: f.name || 'Field', crop: cropName, area: f.area, plantDate: f.plantDate };
    
    if (token) {
      try {
        const res = await api.addField(token, fieldData);
        if (!res.error) {
          const saved = { ...res, id: res._id || res.id };
          setFields([saved, ...fields]);
          setF({ name: '', crop: '', customCrop: '', area: '', plantDate: new Date().toISOString().split('T')[0] });
          alert(L === 'mr' ? '✅ पीक नोंदवले! (MongoDB मध्ये सेव्ह झाले)' : '✅ Crop registered! (Saved to MongoDB)');
        } else {
          alert('Error: ' + (res.error || 'Save failed'));
        }
      } catch (e) { alert('Server error'); }
    } else {
      const localField = { id: Date.now().toString(), ...fieldData };
      setFields([localField, ...fields]);
      setF({ name: '', crop: '', customCrop: '', area: '', plantDate: new Date().toISOString().split('T')[0] });
      alert(L === 'mr' ? '✅ पीक नोंदवले! (लोकल सेव्ह)' : '✅ Crop registered! (Local save)');
    }
    setSaving(false);
  };

  const deleteField = async (fieldId) => {
    if (!window.confirm(L === 'mr' ? 'हे पीक काढून टाकायचे?' : 'Delete this crop?')) return;
    if (token) {
      try { await api.deleteField(token, fieldId); } catch (e) {}
    }
    setFields(fields.filter(x => (x._id || x.id) !== fieldId));
  };

  return (
    <div className="dl-card">
      <h3 style={{fontSize:'1.5rem', marginBottom:'20px'}}>🏡 {L==='mr'?'नवीन पीक नोंदवा':'Register Crop'}</h3>
      <div className="dl-form-grid" style={{marginTop:'20px'}}>
        <div className="dl-input-group">
          <label>{L==='mr'?'पीक निवडा':'Select Crop'}</label>
          <select className="dl-input" value={f.crop} onChange={e=>setF({...f, crop:e.target.value})}>
            <option value="">-- {L==='mr'?'निवडा':'Select'} --</option>
            {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {f.crop === 'Other' && (
          <div className="dl-input-group">
            <label>{L==='mr'?'पिकाचे नाव टाईप करा':'Type Crop Name'}</label>
            <input className="dl-input" placeholder={L==='mr'?'उदा. कोथिंबीर, भेंडी':'e.g. Coriander, Okra'} value={f.customCrop} onChange={e=>setF({...f, customCrop:e.target.value})} />
          </div>
        )}
        <div className="dl-input-group">
          <label>{L==='mr'?'क्षेत्र (एकर)':'Area (Acres)'}</label>
          <input className="dl-input" type="number" placeholder="5" value={f.area} onChange={e=>setF({...f, area:e.target.value})} />
        </div>
        <div className="dl-input-group">
          <label>{L==='mr'?'शेताचे नाव (ऐच्छिक)':'Field Name (optional)'}</label>
          <input className="dl-input" placeholder={L==='mr'?'उदा. पश्चिम शेत':'e.g. West Plot'} value={f.name} onChange={e=>setF({...f, name:e.target.value})} />
        </div>
        <button className="dl-btn-submit" style={{gridColumn: 'span 2'}} onClick={add} disabled={saving}>
          {saving ? '⏳...' : `➕ ${L==='mr'?'नोंदवा':'Register'}`}
        </button>
      </div>
      
      <h3 style={{fontSize:'1.3rem', marginTop:'40px', marginBottom:'20px'}}>🌱 {L==='mr'?'माझी पिके':'My Crops'} ({fields.length})</h3>
      <div className="dl-crop-grid">
        {fields.length === 0 && <p style={{color:'var(--dl-text-muted)', textAlign:'center', padding:'30px'}}>{L==='mr'?'अजून कोणतेही पीक नोंदवलेले नाही.':'No crops registered yet.'}</p>}
        {fields.map(f => (
          <div key={f._id || f.id} className="dl-crop-card-mini" style={{background: 'white', border: '1px solid var(--dl-border)', borderRadius: '20px', padding: '20px', display:'flex', alignItems:'center', gap:'20px', position:'relative'}}>
            <div style={{fontSize:'2.5rem', background:'var(--dl-bg)', padding:'10px', borderRadius:'15px'}}>
              {f.crop.includes('Methi') || f.crop.includes('मेथी') ? '🌿' : f.crop.includes('Onion') || f.crop.includes('कांदा') ? '🧅' : f.crop.includes('Tomato') ? '🍅' : f.crop.includes('Cotton') ? '🏵️' : '🌱'}
            </div>
            <div>
              <h4 style={{fontSize:'1.2rem', fontWeight:900}}>{f.crop}</h4>
              <p style={{color:'var(--dl-text-muted)', fontWeight:700}}>{f.area} Acres • {f.name || 'Field'}</p>
            </div>
            <button onClick={() => deleteField(f._id || f.id)} style={{position:'absolute', top:'10px', right:'10px', background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem', opacity:0.5}}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsView({ T, analytics, L }) {
  const COLORS = ['#059669', '#f43f5e', '#6366f1', '#f59e0b'];
  return (
    <div>
      <div className="dl-stats-grid">
        <div className="dl-stat-card">
          <h4>{L === 'mr' ? 'एकूण उत्पन्न' : 'Total Income'}</h4>
          <span style={{color: 'var(--dl-emerald)'}}>₹{analytics.ti.toLocaleString()}</span>
        </div>
        <div className="dl-stat-card">
          <h4>{L === 'mr' ? 'एकूण खर्च' : 'Total Expense'}</h4>
          <span style={{color: 'var(--dl-rose)'}}>₹{analytics.te.toLocaleString()}</span>
        </div>
      </div>
      <div className="dl-card" style={{height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        {analytics.pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={analytics.pieData} innerRadius={80} outerRadius={120} dataKey="value" paddingAngle={5}>
                {analytics.pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{textAlign:'center', color:'var(--dl-text-muted)'}}>
            <div style={{fontSize:'3rem', marginBottom:'20px'}}>📊</div>
            <p>{L === 'mr' ? 'अहवाल दाखवण्यासाठी अद्याप कोणताही खर्च नोंदवलेला नाही.' : 'No expenses logged yet to show report.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
