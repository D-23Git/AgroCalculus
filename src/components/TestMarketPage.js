import React, { useState, useEffect, useMemo } from 'react';
import './MarketPage.css';
import { DISTRICTS, CROPS, ALL_DISTRICTS } from './MarketData';
import AgroService from '../services/AgroService';
import { FavoritesHubView, CompareHubView } from './HubViews';
import GrievanceSystem from './GrievanceSystem';
import CropDetailModal from './CropDetailModal';

export default function MarketPage({ lang: propL = 'mr', onNavigate }) {
   const [L, setL] = useState(propL);
   useEffect(() => { setL(propL); }, [propL]);
   const [mainView, setMainView] = useState('home');
   const [selMkt, setSelMkt] = useState(null);
   const [isAdmin, setIsAdmin] = useState(() => AgroService.isAdmin());

   const [search, setSearch] = useState('');
   const [selDist, setSelDist] = useState('');
   const [selTal, setSelTal] = useState('');

   const [favIds, setFavIds] = useState([]);
   const [compareIds, setCompareIds] = useState([]);
   const [showGrievance, setShowGrievance] = useState(false);
   const [activeTab, setActiveTab] = useState('rates');
   const [catFilter, setCatFilter] = useState('all');
   const [selCropId, setSelCropId] = useState(null);
   const [userRole, setUserRole] = useState('farmer');

   // 🏢 AUTHORITY DYNAMIC STATE (Isolated per Market)
    const [allMktOverrides, setAllMktOverrides] = useState({});
    const [allMktRequests, setAllMktRequests] = useState(() => {
       const saved = localStorage.getItem('agro-mkt-requests');
       return saved ? JSON.parse(saved) : {};
    });
    const [allMktLogs, setAllMktLogs] = useState(() => {
       const saved = localStorage.getItem('agro-mkt-logs');
       return saved ? JSON.parse(saved) : {};
    });
 
    useEffect(() => {
       localStorage.setItem('agro-mkt-requests', JSON.stringify(allMktRequests));
    }, [allMktRequests]);
 
    useEffect(() => {
       localStorage.setItem('agro-mkt-logs', JSON.stringify(allMktLogs));
    }, [allMktLogs]);
 
    const pendingRequests = allMktRequests[selMkt?.id] || [];
 
    const mktOverrides = allMktOverrides[selMkt?.id] || {
       prices: {},
       alerts: [
          { id: 1, text: "नवा उपक्रम: लवकरच टोकन सिस्टिम सुरू होत आहे.", type: "news", ts: "10:00 AM" },
          { id: 2, text: "महत्त्वाची सूचना: उद्या सुट्टी जाहीर करण्यात आली आहे.", type: "alert", ts: "11:30 AM" }
       ]
    };
 
    const authorityLog = allMktLogs[selMkt?.id] || [
       { id: 'MH-12-SB-4821', type: '🚛 Truck', crop: 'Onion', wt: '42 Q', gate: 'Gate 1', inTime: '08:15 AM', status: 'inside', pay: 'paid' },
       { id: 'MH-09-AK-1234', type: '🚛 Tempo', crop: 'Tomato', wt: '18 Q', gate: 'Gate 2', inTime: '08:42 AM', status: 'inside', pay: 'paid' },
    ];
 
    const [isPaying, setIsPaying] = useState(false);
    const [lastAction, setLastAction] = useState(null);
    const [showPhonePe, setShowPhonePe] = useState(false);
    const [pendingV, setPendingV] = useState(null);
    const [adminSearch, setAdminSearch] = useState('');
 
    const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
    const [adminLogView, setAdminLogView] = useState('pending'); // 'pending' or 'active'
   const [showAuthModal, setShowAuthModal] = useState(false);
   const [staffPinInput, setStaffPinInput] = useState('');
   const [staffIdInput, setStaffIdInput] = useState('');

    // FARMER-ONLY STATE
    const [gatePass, setGatePass] = useState(() => {
       const saved = localStorage.getItem('agro-mkt-gatepass');
       return saved ? JSON.parse(saved) : null;
    });
 
    useEffect(() => {
       localStorage.setItem('agro-mkt-gatepass', JSON.stringify(gatePass));
    }, [gatePass]);
   // LIVE SYNC: Find the pass in global Requests or Logs to reflect Admin changes
   const livePass = useMemo(() => {
      if (!gatePass) return null;
      const clean = (s) => (s || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const targetId = clean(gatePass.id);

      // 1. Look in requests
      const inReq = pendingRequests.find(r => clean(r.id) === targetId);
      if (inReq) return { ...gatePass, ...inReq };
      
      // 2. Look in logs
      const inLogs = authorityLog.find(l => clean(l.id) === targetId);
      if (inLogs) return { ...gatePass, ...inLogs };
      
      return gatePass;
   }, [gatePass, pendingRequests, authorityLog]);

   const [searchVehicle, setSearchVehicle] = useState('');
   const [farmerLogTab, setFarmerLogTab] = useState('pass'); // 'pass' or 'history'

   // ADMIN LOGISTICS DYNAMIC
   const [processingReq, setProcessingReq] = useState(null); // Current request being processed
   const [genAmount, setGenAmount] = useState('50'); // Amount generator

   // ISOLATION HELPERS
   const updateMktLog = (newLog) => {
      setAllMktLogs(prev => ({ ...prev, [selMkt.id]: newLog }));
   };
   const updateMktRequests = (newReqs) => {
      setAllMktRequests(prev => ({ ...prev, [selMkt.id]: newReqs }));
   };
   const updateMktOverrides = (newObj) => {
      setAllMktOverrides(prev => ({ ...prev, [selMkt.id]: newObj }));
   };

   const [isDark, setIsDark] = useState(false);
   const [isListening, setIsListening] = useState(false);
    const [liveTick, setLiveTick] = useState(0);
    const [completedVisit, setCompletedVisit] = useState(null); // Digital Receipt State

   useEffect(() => {
      document.body.className = isDark ? 'dark-mode' : '';
   }, [isDark]);

   useEffect(() => {
      const interval = setInterval(() => setLiveTick(prev => prev + 1), 3000);
      return () => clearInterval(interval);
   }, []);

   const startVoiceSearch = () => {
      if (!('webkitSpeechRecognition' in window)) {
         alert(L === 'mr' ? 'तुमचे ब्राउझर व्हॉइस सर्चला सपोर्ट करत नाही.' : 'Browser does not support voice search.');
         return;
      }
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = L === 'mr' ? 'mr-IN' : 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
         const transcript = event.results[0][0].transcript;
         setSearch(transcript);
      };
      recognition.onerror = (event) => {
         console.error('Speech error', event.error);
         setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
   };

   useEffect(() => {
      if (!selMkt) return;
      setUserRole('farmer');
      setGatePass(null);
   }, [selMkt]);

   const talukas = useMemo(() => {
      if (!selDist || !DISTRICTS[selDist]) return [];
      return Object.entries(DISTRICTS[selDist].talukas).map(([k, v]) => ({ id: k, name: v.name[L] }));
   }, [selDist, L]);

   const ALL_MANDIS = useMemo(() => {
      let list = [];
      Object.entries(DISTRICTS).forEach(([dK, dv]) => {
         Object.entries(dv.talukas).forEach(([tK, tal]) => {
            tal.markets.forEach(m => {
               list.push({ ...m, dK, tK, dN: dv.name[L], tN: tal.name[L] });
            });
         });
      });
      return list;
   }, [L]);

   const filteredMandis = useMemo(() => {
      let list = [...ALL_MANDIS];
      if (selDist) list = list.filter(m => m.dK === selDist);
      if (selTal) list = list.filter(m => m.tK === selTal);
      if (search.trim()) {
         const q = search.toLowerCase();
         list = list.filter(m => m.name[L].toLowerCase().includes(q));
      }
      return list;
   }, [selDist, selTal, search, L]);

   const mktData = useMemo(() => {
      const data = {};
      const varieties = ['Local', 'Deshi', 'S1', 'Hybrid'];
      filteredMandis.forEach(m => {
         data[m.id] = {};
         m.crops.forEach(cid => {
            const c = CROPS[cid];
            if (!c) return;
            // Stable fluctuation based on IDs (no jitter)
            const seed = (m.id.length + cid.length) % 10;
            const fluct = (seed * 20) - 100; 
            const livePrice = c.base + fluct;
            data[m.id][cid] = {
               live: livePrice,
               trend: fluct > 0 ? 'up' : 'down',
               min: Math.floor(livePrice - 300),
               max: Math.floor(livePrice + 400),
               modal: Math.floor(livePrice),
               arrival: Math.floor(100 + (seed * 50)),
               variety: varieties[seed % varieties.length]
            };
         });
      });
      return data;
   }, [filteredMandis]);

   const mktStats = useMemo(() => {
      const stats = {};
      filteredMandis.forEach(m => {
         const trk = Math.floor(Math.random() * 50) + 10;
         const tct = Math.floor(Math.random() * 40) + 5;
         stats[m.id] = { trucks: trk, tractors: tct, total: trk + tct };
      });
      return stats;
   }, [filteredMandis]);

   const toggleFav = (id, e) => {
      e.stopPropagation();
      setFavIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
   };

   const toggleCompare = (id, e) => {
      e.stopPropagation();
      setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 3));
   };

   return (
      <div className={`mandi-hub-era ${L}`}>
         {/* 🔴 NEWS TICKER */}
         <div className="mh-ticker-v2">
            <div className="mh-ticker-label">
               {L === 'mr' ? 'लाईव्ह' : 'LIVE'}
               <span className="ticker-flash"></span>
            </div>
            <div className="mh-t-scroll-wrap">
               <div className="mh-t-scroll">
                  <div className="mh-t-item"><b>{L === 'mr' ? 'नाशिक' : 'NASHIK'}</b> {L === 'mr' ? 'कांदा आवक वाढली, भावात सुधारणा' : 'Onion arrivals up'}</div>
                  <div className="mh-t-item"><b>{L === 'mr' ? 'पुणे' : 'PUNE'}</b> {L === 'mr' ? 'लिंबू दरात मोठी तेजी कायम' : 'Lemon prices record high'}</div>
                  <div className="mh-t-item alert">{L === 'mr' ? 'ब्रेकिंग: खतांच्या किमतीत कपात' : 'BREAKING: Fertilizer prices drop'}</div>
               </div>
            </div>
         </div>

         {/* NAVBAR */}
         <nav className="mh-nav">
            <div className="mh-nav-left">
               <div className="mh-logo" onClick={() => { setSelMkt(null); setMainView('home'); }}>
                  <span className="mh-logo-circle">🌾</span>
                  <div className="mh-logo-txt">
                     <h2>{L === 'mr' ? 'मंडी हब' : 'Mandi Hub'}</h2>
                     <p>{L === 'mr' ? 'व्यावसायिक APMC डिजिटल नोंदणी' : 'Professional APMC Digital Registry'}</p>
                  </div>
               </div>
            </div>
            <div className="mh-nav-right">
               <div className="mh-actions">
                  <button className={mainView === 'home' ? 'adm-on' : ''} onClick={() => { setSelMkt(null); setMainView('home'); }}>🏠 {L === 'mr' ? 'होम' : 'Home'}</button>
                  <button className={mainView === 'seller' ? 'adm-on' : ''} onClick={() => { setSelMkt(null); setMainView('seller'); }}>👨‍🌾 {L === 'mr' ? 'शेतकरी खाते' : 'Farmer'}</button>
                  <button className={mainView === 'fav' ? 'adm-on' : ''} onClick={() => { setSelMkt(null); setMainView('fav'); }}>🌟 {L === 'mr' ? 'आवडते' : 'Fav'}</button>
                  <button className={mainView === 'compare' ? 'adm-on' : ''} onClick={() => { setSelMkt(null); setMainView('compare'); }}>⚖️ {L === 'mr' ? 'तुलना' : 'Compare'}</button>
                  <button onClick={() => setIsDark(!isDark)}>{isDark ? '☀️' : '🌙'}</button>
                  <button className={isAdmin ? "adm-on" : ""} onClick={() => { AgroService.setAdmin(!isAdmin); setIsAdmin(!isAdmin); }}>{L === "mr" ? "प्रशासक" : "Admin"}</button>
                  <button className="lang-toggle" onClick={() => setL(L === "mr" ? "en" : "mr")}>{L === "mr" ? "English" : "मराठी"}</button>
               </div>
            </div>
         </nav>



         <main className="mh-main">
            {mainView === 'home' && !selMkt && (
               <div className="mh-home animate-in">
                  <header className="mh-hero">
                     <div className="mh-hero-bg" />
                     <div className="mh-hero-content animate-in">
                        <p className="mh-tagline">{L === 'mr' ? 'लाईव्ह बाजार भाव' : 'Live Market Prices'}</p>
                        <h1>{L === 'mr' ? 'महाराष्ट्र मार्केट हब' : 'Maharashtra Market Hub'}</h1>
                        <p className="mh-subtitle">{L === 'mr' ? 'महाराष्ट्रातील ३६ जिल्ह्यांचा अधिकृत डेटा' : 'Official data from 36 districts of Maharashtra'}</p>

                        <div className="mh-search-hub">
                           <div className="mh-search-top">
                              <i className="mh-s-icon">🔍</i>
                              <input placeholder={L === 'mr' ? 'बाजार, मार्केट किंवा शेतमाल शोधा...' : 'Search Market or Crops...'} value={search} onChange={e => setSearch(e.target.value)} />
                              <button className={`mh-mic-btn ${isListening ? 'listening' : ''}`} onClick={startVoiceSearch}>
                                 {isListening ? '🎙️...' : '🎤'}
                              </button>
                           </div>
                           <div className="mh-search-bottom">
                              <select value={selDist} onChange={e => { setSelDist(e.target.value); setSelTal(''); }}>
                                 <option value="">{L === 'mr' ? 'सर्व जिल्हे' : 'All Districts'}</option>
                                 {ALL_DISTRICTS.map(d => <option key={d.id} value={d.id}>{d[L]}</option>)}
                              </select>
                              <select value={selTal} onChange={e => setSelTal(e.target.value)} disabled={!selDist}>
                                 <option value="">{L === 'mr' ? 'सर्व तालुके' : 'All Talukas'}</option>
                                 {talukas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                              </select>
                           </div>
                        </div>
                     </div>
                  </header>

                  <div className="mh-traffic-row animate-in" style={{ animationDelay: '0.3s' }}>
                     <div className="mh-traffic-box green" onClick={() => setSelMkt(filteredMandis[0] || ALL_MANDIS[0])}>
                        <div className="tb-left">
                           <span className="tb-name">{L === 'mr' ? 'संगमनेर' : 'Sangamner'}</span>
                           <span className="tb-dist">Ahmednagar (6km)</span>
                        </div>
                        <div className="tb-right">
                           <span className="tb-count">113 {L === 'mr' ? 'वाहने' : 'Vehicles'}</span>
                           <span className="tb-arrow">→</span>
                        </div>
                     </div>
                     <div className="mh-traffic-box orange" onClick={() => setSelMkt(filteredMandis[1] || ALL_MANDIS[1])}>
                        <div className="tb-left">
                           <span className="tb-name">{L === 'mr' ? 'पुणे (खडकी)' : 'Pune (Khadki)'}</span>
                           <span className="tb-dist">Pune (55km)</span>
                        </div>
                        <div className="tb-right">
                           <span className="tb-count">342 {L === 'mr' ? 'वाहने' : 'Vehicles'}</span>
                           <span className="tb-arrow">→</span>
                        </div>
                     </div>
                     <div className="mh-traffic-box blue" onClick={() => setSelMkt(filteredMandis[2] || ALL_MANDIS[2])}>
                        <div className="tb-left">
                           <span className="tb-name">{L === 'mr' ? 'लासलगाव' : 'Lasalgaon'}</span>
                           <span className="tb-dist">Nashik (120km)</span>
                        </div>
                        <div className="tb-right">
                           <span className="tb-count">800+ {L === 'mr' ? 'वाहने' : 'Vehicles'}</span>
                           <span className="tb-arrow">→</span>
                        </div>
                     </div>
                  </div>
                  <div className="mh-section-label">
                     <h3>🏢 {L === 'mr' ? 'उपलब्ध बाजार समित्या' : 'Available Markets'} ({filteredMandis.length})</h3>
                     <p>{L === 'mr' ? 'तुमच्या जवळील महत्वाच्या बाजारपेठा' : 'Important markets near you'}</p>
                  </div>

                  <div className="mh-market-grid">
                     {filteredMandis.length === 0 ? (
                        <div className="hub-empty">
                           <h3>❌ {L === 'mr' ? 'निकाल सापडले नाहीत' : 'No Results Found'}</h3>
                           <p>{L === 'mr' ? 'कृपया फिल्टर तपासा किंवा वेगळे नाव शोधा.' : 'Please adjust filters or search for something else.'}</p>
                        </div>
                     ) : (
                        filteredMandis.map(m => (
                           <div key={m.id} className="mh-m-card-v26" onClick={() => setSelMkt(m)}>
                              <div className="mc-top-row">
                                 <div className="mc-live-badge">
                                    <div className="mc-live-dot" /> LIVE
                                 </div>
                                 <div className="mc-near-pill">{L === 'mr' ? 'जवळ' : 'Near'}</div>
                              </div>
                              <div className="mc-body">
                                 <span className="mc-location">📍 📍 <b>{m.dN}</b></span>
                                 <h3 className="mc-name">{m.name[L]} {L === 'mr' ? 'कृषी उत्पन्न बाजार' : 'APMC'}</h3>
                                 <div className="mc-bar-wrap">
                                    <div className="mc-bar-fill" style={{ width: `${60 + Math.random() * 30}%` }} />
                                 </div>
                                 <div className="mc-bar-labels">
                                    <span>{mktStats[m.id]?.total} {L === 'mr' ? 'वाहने' : 'Vehicles'}</span>
                                    <span>⭐ {m.trader.rating}</span>
                                 </div>
                              </div>
                              <div className="mc-footer">
                                 <div className="mc-actions">
                                    <button className={`mc-fav-btn2 ${favIds.includes(m.id) ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFav(m.id, e); }}>
                                       {favIds.includes(m.id) ? '❤️' : '🤍'}
                                    </button>
                                    <button className={`mc-cmp-btn2 ${compareIds.includes(m.id) ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); toggleCompare(m.id, e); }}>
                                       ⚖️ {compareIds.includes(m.id) ? 'Selected' : 'Compare'}
                                    </button>
                                 </div>
                                 <button className="m-action-btn" onClick={() => setSelMkt(m)}>{L === 'mr' ? 'माहिती पहा' : 'View Info'} ➔</button>
                              </div>
                           </div>
                        )))
                     }
                  </div>
               </div>
            )}

            {selMkt ? (
               <div className="mh-mkt-detail animate-in">
                  <header className="mh-elite-banner">
                     <div className="elite-banner-overlay" />
                     <div className="elite-header-top">
                        <button className="btn-mandi-back" onClick={() => { setSelMkt(null); setIsStaffLoggedIn(false); setUserRole('farmer'); }}>← {L === 'mr' ? 'सर्व बाजार समित्या' : 'All Markets'}</button>

                        <div className="role-switcher-pill">
                           <button
                              className={userRole === 'farmer' ? 'active' : ''}
                              onClick={() => {
                                 setUserRole('farmer');
                                 setIsStaffLoggedIn(false);
                              }}
                           >
                              👨‍🌾 {L === 'mr' ? 'शेतकरी' : 'Farmer'}
                           </button>
                           <button
                              className={userRole === 'authority' ? 'active' : ''}
                              onClick={() => {
                                 if (!isStaffLoggedIn) {
                                    setShowAuthModal(true);
                                 } else {
                                    setUserRole('authority');
                                 }
                              }}
                           >
                              🏢 {L === 'mr' ? 'प्रशासक' : 'Admin'}
                           </button>
                        </div>

                        {!isStaffLoggedIn && userRole === 'farmer' && (
                           <button className="mkt-auth-entry" onClick={() => setShowAuthModal(true)}>
                              🔑 {L === 'mr' ? 'लॉगिन' : 'Login'}
                           </button>
                        )}
                     </div>
                     <div className="elite-identity-section">
                        <div className="eis-left">
                           <div className="eis-breadcrumb">MAHARASHTRA • {selMkt.dN} • {selMkt.tN}</div>
                           <h1 className="eis-mkt-name">
                              <span className="primary">{selMkt.name.en}</span>
                              <span className="marathi">{selMkt.name.mr}</span>
                           </h1>
                           <div className="eis-meta-row">
                              <div className="emr-item">📍 <b>{selMkt.location[L]}</b></div>
                              <div className="emr-item">🚚 <b>113</b> {L === 'mr' ? 'वाहने' : 'Vehicles'}</div>
                              <div className="emr-status-pill">◎ {L === 'mr' ? 'सुरू' : 'OPEN'}</div>
                           </div>
                        </div>
                        <div className="eis-right">
                           <div className="eis-trade-intel">
                              <div className="eti-label">TRADE ANALYTICS</div>
                              <div className="eti-value">92%</div>
                              <div className="eti-desc">Trader Activity</div>
                              <div className="eti-bar-wrap"><div className="eti-bar-fill" style={{ width: '92%' }}></div></div>
                           </div>
                        </div>
                     </div>
                  </header>

                  <div className="mh-layout-row modern-dashboard-layout with-sidebar">
                     <aside className="mdl-sidebar">
                        <div className="mh-detail-tabs v2 vertical">
                           {isStaffLoggedIn && (
                              <div className="role-identity-banner authority">
                                 <span>🏢 {L === 'mr' ? 'अधिकारी मोड' : 'Authority Mode'}</span>
                              </div>
                           )}
                           <button className={activeTab === 'rates' ? 'on' : ''} onClick={() => setActiveTab('rates')}>💰 {L === 'mr' ? 'लाईव्ह दर' : 'Live Rates'}</button>
                           {userRole === 'farmer' && (
                              <button className={activeTab === 'traders' ? 'on' : ''} onClick={() => setActiveTab('traders')}>🤝 {L === 'mr' ? 'व्यापारी' : 'Traders'}</button>
                           )}
                           <button className={activeTab === 'logistics' ? 'on' : ''} onClick={() => setActiveTab('logistics')}>
                              {userRole === 'farmer' ? `📝 ${L === 'mr' ? 'गेट नोंदणी' : 'Gate Entry'}` : `🚛 ${L === 'mr' ? 'वाहन लॉग' : 'Vehicle Log'}`}
                           </button>
                           <button className="sb-btn-grievance" onClick={() => setShowGrievance(true)}>⚖️ {L === 'mr' ? 'तक्रार निवारण' : 'Grievance'}</button>
                        </div>

                        {activeTab === 'rates' && (
                           <div className="sidebar-section">
                              <h3 className="sb-title">{L === 'mr' ? 'शेतमाल वर्गवारी' : 'Crop Categories'}</h3>
                              <div className="mh-filter-pills vertical">
                                 {['all', 'grain', 'veg', 'fruit', 'spice'].map(k => (
                                    <button key={k} className={catFilter === k ? 'on' : ''} onClick={() => setCatFilter(k)}>
                                       {k === 'all' ? (L === 'mr' ? 'सर्व' : 'All') : (L === 'mr' ? { grain: 'धान्य', veg: 'भाजीपाला', fruit: 'फळे', spice: 'मसाले' }[k] : k)}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        )}

                        {isStaffLoggedIn && (
                           <div className="sidebar-section auth-staff-action">
                              <h3 className="sb-title">📜 {L === 'mr' ? 'लाईव्ह घोषणा' : 'Live Bulletin'}</h3>
                              <form className="sb-broadcast-form" onSubmit={(e) => {
                                 e.preventDefault();
                                 const msg = e.target.msg.value;
                                 if (msg) {
                                    const newAlert = {
                                       id: Date.now(),
                                       text: msg,
                                       type: 'news',
                                       ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    };
                                    updateMktOverrides({ ...mktOverrides, alerts: [newAlert, ...mktOverrides.alerts] });
                                    e.target.reset();
                                    setLastAction(L === 'mr' ? "घोषणा प्रसिद्ध झाली!" : "Broadcast Sent!");
                                    setTimeout(() => setLastAction(null), 3000);
                                 }
                              }}>
                                 <input name="msg" className="sb-msg-input" placeholder={L === 'mr' ? 'काय जाहीर करायचे आहे?' : 'What to broadcast?'} required />
                                 <button type="submit" className="sb-btn-broadcast">📡 Broadcast</button>
                              </form>

                              <div className="sb-active-notices">
                                 <label>{L === 'mr' ? 'सक्रिय घोषणा' : 'Active Notices'}</label>
                                 <div className="sb-notices-list">
                                    {mktOverrides.alerts.map(a => (
                                       <div key={a.id} className="sb-notice-item">
                                          <span>{a.text?.substring(0, 20) || ''}...</span>
                                          <button className="btn-not-del" onClick={() => {
                                             updateMktOverrides({ ...mktOverrides, alerts: mktOverrides.alerts.filter(x => x.id !== a.id) });
                                             setLastAction(L === 'mr' ? "घोषणा काढून टाकली!" : "Notice Deleted!");
                                             setTimeout(() => setLastAction(null), 3000);
                                          }}>🗑️</button>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        )}
                     </aside>

                     <div className="mdl-main-content">
                        {activeTab === 'rates' && (
                           <div className="mh-rates-tab-wrap">
                              {mktOverrides.alerts.length > 0 && (
                                 <div className="mh-notice-board-inside">
                                    <div className="nb-header">
                                       <span className="nb-title">📢 {L === 'mr' ? `${selMkt.name[L]} विशेष सूचना` : `${selMkt.name.en} Special Notices`}</span>
                                    </div>
                                    <div className="nb-grid">
                                       {mktOverrides.alerts.map(a => (
                                          <div key={a.id} className={`nb-card ${a.type}`}>
                                             <div className="nb-card-header">
                                                <span className="nb-badge">{a.type.toUpperCase()}</span>
                                                <span className="nb-ts">{a.ts}</span>
                                             </div>
                                             <p className="nb-text">{a.text}</p>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}

                              <div className="mh-rates-grid">
                                 {selMkt.crops.filter(cid => catFilter === 'all' || CROPS[cid]?.cat === catFilter).map(cid => {
                                    const c = CROPS[cid];
                                    const data = mktData[selMkt.id]?.[cid];
                                    if (!c || !data) return null;
                                    const displayPrice = mktOverrides.prices[cid]?.modal || data.modal;
                                    return (
                                       <div key={cid} className="mh-crop-p-card" onClick={() => setSelCropId(cid)}>
                                          <div className="mcp-header">
                                             <div className="mcp-badge stable"><span className="mcp-live-dot" />STABLE</div>
                                             {isStaffLoggedIn && (
                                                <button className="mcp-edit-btn" onClick={(e) => {
                                                   e.stopPropagation();
                                                   const val = prompt(`${c[L]} नवीन भाव:`, displayPrice);
                                                   if (val) {
                                                      updateMktOverrides({
                                                         ...mktOverrides,
                                                         prices: { ...mktOverrides.prices, [cid]: { ...data, modal: parseInt(val) } }
                                                      });
                                                      setLastAction(L === 'mr' ? "भाव अपडेट झाला!" : "Price Updated!");
                                                      setTimeout(() => setLastAction(null), 3000);
                                                   }
                                                }}>✏️</button>
                                             )}
                                          </div>
                                          <div className="mcp-img"><span className="mcp-crop-emoji">{c.icon}</span></div>
                                          <div className="mcp-crop-title"><h4>{c[L]}</h4></div>
                                          <div className="mcp-price-main"><span>₹{displayPrice.toLocaleString()}</span><small>/Q</small></div>
                                          <div className="mcp-apmc-grid">
                                             <div className="apmc-stat"><b>₹{data.max}</b><small>MAX</small></div>
                                             <div className="apmc-stat"><b>{data.arrival} Q</b><small>ARR</small></div>
                                          </div>
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>
                        )}

                        {activeTab === 'traders' && (
                           <div className="mh-elite-feature-view animate-in">
                              <div className="ef-label">🤝 {L === 'mr' ? 'नोंदणीकृत व्यापारी' : 'Licensed Traders'}</div>
                              <div className="trader-actions-grid animate-in">
                                 {[
                                    { n: L === 'mr' ? 'राजेंद्र पाटील ट्रेडर्स' : 'Rajendra Patil Traders', lic: 'APMC/PN-2891', ph: '+919876543210' },
                                    { n: L === 'mr' ? 'महादेव किराणा भंडार' : 'Mahadev Kirana Bhandar', lic: 'APMC/AN-9902', ph: '+919988776655' },
                                    { n: L === 'mr' ? 'विठ्ठल ॲग्रो एजन्सी' : 'Vitthal Agro Agency', lic: 'APMC/NS-4321', ph: '+919422001122' },
                                    { n: L === 'mr' ? 'स्वामी समर्थ व्हेजीटेबल्स' : 'Swami Samarth Veg', lic: 'APMC/PN-1100', ph: '+918877001122' }
                                 ].map((tr, i) => (
                                    <div key={i} className="trader-premium-card glass-card">
                                       <div className="tpc-header">
                                          <div className="tpc-avatar">{tr.n.charAt(0)}</div>
                                          <div className="tpc-info">
                                             <h5>{tr.n}</h5>
                                             <span>📜 {tr.lic}</span>
                                          </div>
                                       </div>
                                       <div className="tpc-footer">
                                          <a href={`tel:${tr.ph}`} className="btn-call">📞 {L === 'mr' ? 'कॉल करा' : 'Call'}</a>
                                          <a href={`https://wa.me/${tr.ph.replace('+', '')}`} target="_blank" rel="noreferrer" className="btn-whatsapp">💬 WhatsApp</a>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}

                        {`gate-gauge-circular-wrap ${isHigh ? 'busy' : 'smooth'}`}
{showPhonePe && (
                              <div className="phonepe-overlay animate-in">
                                 <div className="phonepe-modal">
                                    <div className="pp-header">
                                       <div className="pp-logo">PhonePe</div>
                                       <button className="pp-close" onClick={() => setShowPhonePe(false)}>✕</button>
                                    </div>
                                    {isPaying ? (
                                       <div className="pp-success-screen animate-in">
                                          <div className="pp-check-circle">✓</div>
                                          <h3>{L === 'mr' ? 'पेमेंट यशस्वी!' : 'Payment Successful!'}</h3>
                                          <p>₹50.00 {L === 'mr' ? 'बाजार समितीला पाठवले' : 'Sent to APMC'}</p>
                                       </div>
                                    ) : (
                                       <div className="pp-body">
                                          <div className="pp-amount-card">
                                             <span>{L === 'mr' ? 'देय रक्कम' : 'Amount to Pay'}</span>
                                             <h2>{pendingV?.fee || '₹50.00'}</h2>
                                          </div>
                                          <div className="pp-upi-options">
                                             <div className="pp-option active">
                                                <img src="https://img.icons8.com/color/48/000000/upi.png" alt="UPI" />
                                                <span>UPI ID / App</span>
                                             </div>
                                          </div>
                                          <button className="pp-pay-btn" onClick={() => {
                                             setIsPaying(true);
                                             setTimeout(() => {
                                                const updatedPass = { ...pendingV, status: 'inside', pay: 'paid', inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                                                updateMktLog([updatedPass, ...authorityLog]);
                                                updateMktRequests(pendingRequests.filter(r => r.id !== pendingV.id));
                                                setGatePass(updatedPass);
                                                setIsPaying(false);
                                                setTimeout(() => setShowPhonePe(false), 2000);
                                                setLastAction(L === 'mr' ? "पेमेंट यशस्वी! तुमचा पास आता सक्रिय आहे. ✅" : "Payment Successful! Pass is now Active. ✅");
                                                setTimeout(() => setLastAction(null), 3000);
                                             }, 2500);
                                          }}>
                                             {L === 'mr' ? 'टॅप करून पेमेंट करा' : 'Tap to Pay ₹50'}
                                          </button>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               ) : (
               <div className="mh-selection-hub animate-in">
                  <div className="sh-hero">
                     <h1>MANDI<span>HUB</span></h1>
                     <p>{L === 'mr' ? 'महाराष्ट्रातील सर्वात मोठे कृषी बाजार सोल्यूशन' : 'Maharashtra\'s Largest Agricultural Market Solution'}</p>
                  </div>
                  <div className="sh-search-box glass-card">
                     <input
                        placeholder={L === 'mr' ? 'तुमचे शहर किंवा बाजारपेठ शोधा...' : 'Search your city or market...'}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                     />
                     <div className="sh-quick-chips">
                        {['Pune', 'Mumbai', 'Nashik', 'Nagpur'].map(c => (
                           <button key={c} onClick={() => setSearch(c)}>{c}</button>
                        ))}
                     </div>
                  </div>
                  <div className="sh-grid">
                     {Object.values(ALL_DISTRICTS).flatMap(d => d.markets || [])
                        .filter(m => m && m.name && (m.name[L]?.toLowerCase().includes(search.toLowerCase()) || m.name.en?.toLowerCase().includes(search.toLowerCase())))
                        .map(m => (
                           <div key={m.id} className="sh-card glass-card" onClick={() => setSelMkt(m)}>
                              <div className="sh-card-icon">🏗</div>
                              <h4>{m.name[L]}</h4>
                              <p>{L === 'mr' ? 'लाईव्ह बाजार भाव व लॉजिस्टिक' : 'Live Rates & Logistics'}</p>
                           </div>
                        ))}
                  </div>
               </div>
            )}

            {showGrievance && (
               <div className="mh-modal-overlay" onClick={() => setShowGrievance(false)}>
                  <div className="mh-modal-content" onClick={e => e.stopPropagation()}>
                     <GrievanceSystem lang={L} onClose={() => setShowGrievance(false)} />
                  </div>
               </div>
            )}

            {showAuthModal && (
               <div className="auth-modal-overlay">
                  <div className="auth-modal-card animate-in">
                     <div className="amc-header">
                        <span className="amc-icon">🏢</span>
                        <h2>{L === 'mr' ? 'बाजार समिती कर्मचारी लॉगिन' : 'APMC Administration Login'}</h2>
                        <p>{L === 'mr' ? 'कृपया तुमचा अधिकृत कर्मचारी आयडी आणि पिन टाका' : 'Please enter your official ID and security PIN'}</p>
                     </div>
                     <div className="amc-form">
                        <div className="amc-input-group">
                           <label>{L === 'mr' ? 'कर्मचारी आयडी (Staff ID)' : 'Staff ID'}</label>
                           <input
                              type="text"
                              placeholder="APMC-XXXX"
                              value={staffIdInput}
                              onChange={e => setStaffIdInput(e.target.value.toUpperCase())}
                              className="amc-staff-id-input"
                           />
                        </div>
                        <div className="amc-input-group">
                           <label>{L === 'mr' ? 'सुरक्षा पिन' : 'Security PIN'}</label>
                           <input
                              type="password"
                              value={staffPinInput}
                              onChange={e => setStaffPinInput(e.target.value)}
                              maxLength={4}
                              onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                    if (selMkt && staffPinInput === AgroService.getMarketPIN(selMkt.id) && staffIdInput.startsWith('APMC')) {
                                       setIsStaffLoggedIn(true);
                                       setUserRole('authority');
                                       setShowAuthModal(false);
                                    } else {
                                       alert(L === 'mr' ? 'चुकीचा आयडी किंवा पिन!' : 'Invalid ID or PIN!');
                                    }
                                 }
                              }}
                           />
                        </div>
                     </div>
                     <div className="amc-footer">
                        <button className="amc-login-btn-final" onClick={() => {
                           if (selMkt && staffPinInput === AgroService.getMarketPIN(selMkt.id) && staffIdInput.startsWith('APMC')) {
                              setIsStaffLoggedIn(true);
                              setUserRole('authority');
                              setShowAuthModal(false);
                           } else {
                              alert(L === 'mr' ? 'चुकीचा आयडी किंवा पिन!' : 'Invalid ID or PIN!');
                           }
                        }}>
                           🚀 {L === 'mr' ? 'प्रवेश करा' : 'Validate & Enter'}
                        </button>
                        <p className="amc-pin-hint">
                           💡 {L === 'mr' ? 'तुमचा पिन' : 'Your PIN'}: <b>{selMkt ? AgroService.getMarketPIN(selMkt.id) : '----'}</b>
                        </p>
                        <button className="amc-close-btn" onClick={() => {
                           setShowAuthModal(false);
                           setUserRole('farmer');
                        }}>
                           {L === 'mr' ? 'रद्द करा' : 'Cancel'}
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {lastAction && (
               <div className="auth-success-toast animate-in">
                  <span>✅ {lastAction}</span>
               </div>
            )}

            {selCropId && (
               <CropDetailModal
                  crop={CROPS[selCropId]}
                  data={mktOverrides.prices[selCropId] || mktData[selMkt.id]?.[selCropId]}
                  lang={L}
                  onClose={() => setSelCropId(null)}
               />
            )}

            {completedVisit && (
               <div className="receipt-overlay animate-in" onClick={() => setCompletedVisit(null)}>
                  <div className="receipt-card glass-card" onClick={e => e.stopPropagation()}>
                     <div className="receipt-header">
                        <div className="receipt-mkt">
                           <h5>{selMkt.name[L]} APMC</h5>
                           <span>{L === 'mr' ? 'अधिकृत डिजिटल पावती' : 'Official Digital Receipt'}</span>
                        </div>
                        <div className="receipt-stamp">PAID</div>
                     </div>
                     
                     <div className="receipt-body">
                        <div className="receipt-id-section">
                           <label>{L === 'mr' ? 'पावती क्रमांक' : 'Receipt ID'}</label>
                           <h3>#MKT-{completedVisit.id.replace(/-/g,'')}</h3>
                        </div>

                        <div className="receipt-grid">
                           <div className="r-item">
                              <label>{L === 'mr' ? 'वाहन क्र.' : 'Vehicle No'}</label>
                              <b>{completedVisit.id}</b>
                           </div>
                           <div className="r-item">
                              <label>{L === 'mr' ? 'शेतमाल' : 'Crop'}</label>
                              <b>{completedVisit.crop}</b>
                           </div>
                           <div className="r-item">
                              <label>{L === 'mr' ? 'एंट्री' : 'Entry'}</label>
                              <b>{completedVisit.inTime}</b>
                           </div>
                           <div className="r-item">
                              <label>{L === 'mr' ? 'एक्झिट' : 'Exit'}</label>
                              <b>{completedVisit.outTime}</b>
                           </div>
                        </div>

                        <div className="receipt-amount-row">
                           <label>{L === 'mr' ? 'एकूण फी (Paid)' : 'Total Fee (Paid)'}</label>
                           <span className="price">₹{completedVisit.fee || '50'}</span>
                        </div>

                        <div className="receipt-footer-note">
                           <p>✅ {L === 'mr' ? 'महाराष्ट्र कृषी पणन मंडळ - अधिकृत' : 'MSAMB Authorized Document'}</p>
                        </div>
                     </div>

                     <div className="receipt-actions">
                        <button className="btn-receipt-share" onClick={() => {
                           const text = `Digital Pass: ${completedVisit.id}\nMarket: ${selMkt.name[L]}\nExit: ${completedVisit.outTime}\nStatus: Completed`;
                           window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                        }}>
                           💬 {L === 'mr' ? 'शेअर करा' : 'Share Receipt'}
                        </button>
                        <button className="btn-receipt-close" onClick={() => setCompletedVisit(null)}>
                           {L === 'mr' ? 'बंद करा' : 'Close'}
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </main>


      </div>
   );
}
