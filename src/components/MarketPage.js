import React, { useState, useEffect, useMemo } from 'react';
import './MarketPage.css';
import { DISTRICTS, CROPS, ALL_DISTRICTS } from './MarketData';
import AgroService from '../services/AgroService';
import api from '../utils/apiService';
import { FavoritesHubView, CompareHubView } from './HubViews';
import GrievanceSystem from './GrievanceSystem';
import CropDetailModal from './CropDetailModal';

export default function MarketPage({ lang: propL = 'mr', onNavigate, profile }) {
   const userId = profile?._id || profile?.id || 'guest';
   const [L, setL] = useState(propL);
   useEffect(() => { setL(propL); }, [propL]);
   const [mainView, setMainView] = useState('home');
   const [selMkt, setSelMkt] = useState(null);

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
   const [mktOverrides, setMktOverrides] = useState({ prices: {}, alerts: [] });
   const [authorityLog, setAuthorityLog] = useState([]);

   const [pendingRequests, setPendingRequests] = useState([]);

   useEffect(() => {
      if (selMkt) {
         // 🛡️ ISOLATION: Check if this user is a remembered staff for THIS SPECIFIC market
         setIsStaffLoggedIn(false);
         setUserRole('farmer');

         const fetchMktData = async () => {
            try {
               const [p, l, a, reqs] = await Promise.all([
                  api.getMandiPricesLive(selMkt.id), // Updated to call Live API
                  api.getMandiLogs(selMkt.id),
                  api.getMandiAlerts(selMkt.id),
                  api.getLogisticsRequests(selMkt.id)
               ]);
               const priceMap = {};
               if (Array.isArray(p)) p.forEach(x => priceMap[x.cropId] = x);
               updateMktOverrides({ prices: priceMap, alerts: Array.isArray(a) ? a : [] });
               updateMktLog(Array.isArray(l) ? l : []);
               updateMktRequests(Array.isArray(reqs) ? reqs : []);
            } catch (e) { console.error(e); }
         };
         fetchMktData();
      } else {
         // Reset when going back home
         setIsStaffLoggedIn(false);
         setUserRole('farmer');
      }
   }, [selMkt, userId]);

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

   // 🚀 AUTO-ACTIVATE OFFICER MODE: If an Officer logged in from LoginPage directly
   useEffect(() => {
      if (profile?.role === 'staff' && profile?.mandiId) {
         const parts = profile.mandiId.split('_');
         const distId = parts[0];
         // Auto-select district
         setSelDist(distId);
         // Find the taluka and market from DISTRICTS data
         const distData = DISTRICTS[distId];
         if (distData) {
            // Find matching taluka key
            const talukaKey = Object.keys(distData.talukas).find(tk =>
               profile.mandiId.includes(tk)
            );
            if (talukaKey) {
               setSelTal(talukaKey);
               const market = distData.talukas[talukaKey]?.markets?.find(
                  m => m.id === profile.mandiId
               );
               if (market) {
                  setSelMkt(market);
                  setMainView('market');
                  // Auto-login as staff for this market
                  setTimeout(() => {
                     setIsStaffLoggedIn(true);
                     setUserRole('authority');
                  }, 500);
               }
            }
         }
      }
   }, [profile?.mandiId]);


   const [gatePass, setGatePass] = useState(null);

   // When market changes or user changes, reset and try to load the pass for THAT specific market + user
   useEffect(() => {
      if (!selMkt) return;
      setGatePass(null); // Reset first
      const saved = localStorage.getItem(`agro-mkt-gatepass-${userId}-${selMkt.id}`);
      if (saved) {
         try { setGatePass(JSON.parse(saved)); } catch (e) { }
      }
   }, [selMkt, userId]);

   // Save pass whenever it changes, but only if we have a market and user
   useEffect(() => {
      if (selMkt && userId && gatePass) {
         localStorage.setItem(`agro-mkt-gatepass-${userId}-${selMkt.id}`, JSON.stringify(gatePass));
      } else if (selMkt && userId && !gatePass) {
         localStorage.removeItem(`agro-mkt-gatepass-${userId}-${selMkt.id}`);
      }
   }, [gatePass, selMkt, userId]);
   // LIVE SYNC: Find the pass in global Requests or Logs to reflect Admin changes
   // Notification Trigger
   useEffect(() => {
      if (gatePass && gatePass.status === 'Approved' && !isStaffLoggedIn) {
         setLastAction(L === 'mr' ? "🎉 तुमचा गेट पास मंजूर झाला आहे! आता तुम्ही पेमेंट करू शकता." : "🎉 Your Gate Pass is Approved! You can pay now.");
         // Play a subtle sound or trigger haptic
         if (window.navigator.vibrate) window.navigator.vibrate(200);
      }
   }, [gatePass?.status]);

   const livePass = useMemo(() => {
      if (!gatePass) return null;
      const targetVeh = (gatePass.vehicleNo || '').toUpperCase();
      const targetId = gatePass._id;

      // 1. Look in requests
      const inReq = pendingRequests.find(r => r._id === targetId || (r.vehicleNo && r.vehicleNo.toUpperCase() === targetVeh));
      if (inReq) return { ...gatePass, ...inReq };

      // 2. Look in logs
      const inLogs = authorityLog.find(l => l._id === targetId || (l.vehicleNo && l.vehicleNo.toUpperCase() === targetVeh));
      if (inLogs) return { ...gatePass, ...inLogs };

      return gatePass;
   }, [gatePass, pendingRequests, authorityLog]);

   const [farmerLogTab, setFarmerLogTab] = useState('pass'); // 'pass' or 'history'

   // ADMIN LOGISTICS DYNAMIC
   const [processingReq, setProcessingReq] = useState(null); // Current request being processed
   const [genAmount, setGenAmount] = useState('50'); // Amount generator

   // ISOLATION HELPERS
   const updateMktLog = (newLog) => {
      const unique = Array.from(new Map(newLog.map(item => [item._id || item.id, item])).values());
      setAuthorityLog(unique);
   };

   const filteredRequests = useMemo(() => {
      if (isStaffLoggedIn) return pendingRequests;
      return pendingRequests.filter(r => r.userId === userId);
   }, [pendingRequests, isStaffLoggedIn, userId]);

   const filteredLog = useMemo(() => {
      if (isStaffLoggedIn) return authorityLog;
      // Also allow matching by vehicle number if userId is missing (for transition)
      return authorityLog.filter(l => l.userId === userId || (!l.userId && gatePass && (l.vehicleNo === gatePass.vehicleNo)));
   }, [authorityLog, isStaffLoggedIn, userId, gatePass]);
   const updateMktRequests = (newReqs) => {
      const unique = Array.from(new Map(newReqs.map(item => [item._id || item.id, item])).values());
      setPendingRequests(unique);
   };
   const updateMktOverrides = (newObj) => {
      setMktOverrides(newObj);
   };

   const handleStaffLogin = (status) => {
      setIsStaffLoggedIn(status);
      setUserRole(status ? 'authority' : 'farmer');
      if (selMkt) {
         localStorage.setItem(`agro-mkt-staff-${userId}-${selMkt.id}`, status);
      }
   };

   const [isDark, setIsDark] = useState(false);
   const [isListening, setIsListening] = useState(false);
   const [livePriceFluctuations, setLivePriceFluctuations] = useState({});

   const triggerUPI = (app) => {
      const vpa = "9373082323-2@ybl"; // Production VPA
      const name = "APMC Office";
      const amt = pendingV?.fee?.replace(/[^0-9]/g, '') || 50;
      let url = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR&tn=MandiPass`;

      if (app === 'phonepe') url = `phonepe://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`;
      if (app === 'gpay') url = `tez://upi/pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`;
      if (app === 'paytm') url = `paytmmp://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`;

      window.location.href = url;

      setIsPaying(true);
      setTimeout(() => {
         const inTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
         api.updateLogisticsStatus(pendingV._id || pendingV.id, 'Approved').then(() => {
            api.addMandiLog({
               mandiId: selMkt.id,
               vehicleNo: pendingV.vehicleNo || pendingV.id,
               driver: pendingV.driverName || pendingV.driver,
               type: '🚛 Truck',
               crop: pendingV.cropName || pendingV.crop,
               weight: pendingV.quantity || pendingV.wt,
               status: 'inside',
               payStatus: 'paid',
               fee: pendingV.fee || '₹50',
               userId: pendingV.userId || userId,
               inTime: inTime
            }).then(resLog => {
               const updatedPass = { ...pendingV, ...resLog, status: 'inside', pay: 'paid', inTime };
               updateMktLog([updatedPass, ...authorityLog]);
               setGatePass(updatedPass);
               setLastAction(L === 'mr' ? "पेमेंट यशस्वी! गाडी मार्केटमध्ये प्रवेश करू शकते. ✅" : "Payment Successful! Vehicle can enter. ✅");
               setTimeout(() => setLastAction(null), 4000);
            });
         });
      }, 5000);
   };

   useEffect(() => {
      const interval = setInterval(() => {
         // Generate small random fluctuations for "Live" feel
         const fluctuations = {};
         if (selMkt) {
            selMkt.crops.forEach(cid => {
               fluctuations[cid] = (Math.random() * 20 - 10).toFixed(0); // +/- 10 rs
            });
         }
         setLivePriceFluctuations(fluctuations);
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
   }, [selMkt]);
   const [completedVisit, setCompletedVisit] = useState(null); // Digital Receipt State

   const [logisticsForm, setLogisticsForm] = useState({
      driverName: '', vehicleNo: '', cropName: '', quantity: '', contact: ''
   });
   useEffect(() => {
      document.body.className = isDark ? 'dark-mode' : '';
   }, [isDark]);

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
      // Fetch logistics requests and logs from backend
      const fetchMarketData = async () => {
         try {
            const [reqs, logs] = await Promise.all([
               api.getLogisticsRequests(selMkt.id),
               api.getMandiLogs(selMkt.id)
            ]);
            if (Array.isArray(reqs) && !reqs.error) {
               updateMktRequests(reqs.filter(r => r.status !== 'Approved'));
            }
            if (Array.isArray(logs) && !logs.error) {
               updateMktLog(logs);
            }
         } catch (e) { console.error('Fetch market data error:', e); }
      };
      fetchMarketData();
      // Poll every 5 seconds so farmer sees admin updates (fee, status changes)
      const poll = setInterval(fetchMarketData, 5000);

      return () => clearInterval(poll);
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
   }, [selDist, selTal, search, L, ALL_MANDIS]);

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
                  <button className={mainView === 'fav' ? 'adm-on' : ''} onClick={() => { setSelMkt(null); setMainView('fav'); }}>🌟 {L === 'mr' ? 'आवडते' : 'Fav'}</button>
                  <button className={mainView === 'compare' ? 'adm-on' : ''} onClick={() => { setSelMkt(null); setMainView('compare'); }}>⚖️ {L === 'mr' ? 'तुलना' : 'Compare'}</button>
                  <button onClick={() => setIsDark(!isDark)}>{isDark ? '☀️' : '🌙'}</button>
                  {isStaffLoggedIn && (
                     <button className="mh-logout-btn" onClick={() => handleStaffLogin(false)} style={{ marginRight: '10px', background: '#ff4757', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                        {L === 'mr' ? 'बाहेर पडा' : 'Logout'}
                     </button>
                  )}
                  <button className="lang-toggle" onClick={() => setL(L === "mr" ? "en" : "mr")}>{L === "mr" ? "English" : "मराठी"}</button>
                  <button className="btn-back-landing" onClick={() => onNavigate && onNavigate("home")}>
                     {L === 'mr' ? 'मुख्य पृष्ठावर' : 'Main Page'}
                  </button>
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
                     <div className="mh-traffic-box green" onClick={() => setSelMkt(ALL_MANDIS.find(m => m.id === 'ahilyanagar_sangamner_sangamner_city') || ALL_MANDIS[0])}>
                        <div className="tb-left">
                           <span className="tb-name">{L === 'mr' ? 'संगमनेर' : 'Sangamner'}</span>
                           <span className="tb-dist">Ahmednagar (6km)</span>
                        </div>
                        <div className="tb-right">
                           <span className="tb-count">113 {L === 'mr' ? 'वाहने' : 'Vehicles'}</span>
                           <span className="tb-arrow">→</span>
                        </div>
                     </div>
                     <div className="mh-traffic-box orange" onClick={() => setSelMkt(ALL_MANDIS.find(m => m.id === 'pune_haveli_pune_khadki') || ALL_MANDIS[0])}>
                        <div className="tb-left">
                           <span className="tb-name">{L === 'mr' ? 'पुणे (खडकी)' : 'Pune (Khadki)'}</span>
                           <span className="tb-dist">Pune (55km)</span>
                        </div>
                        <div className="tb-right">
                           <span className="tb-count">342 {L === 'mr' ? 'वाहने' : 'Vehicles'}</span>
                           <span className="tb-arrow">→</span>
                        </div>
                     </div>
                     <div className="mh-traffic-box blue" onClick={() => setSelMkt(ALL_MANDIS.find(m => m.id === 'nashik_niphad_lasalgaon') || ALL_MANDIS[0])}>
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

            {mainView === 'fav' && !selMkt && (
               <FavoritesHubView
                  L={L}
                  favIds={favIds}
                  filteredMandis={ALL_MANDIS}
                  CROPS={CROPS}
                  mktData={mktData}
                  mktStats={mktStats}
                  setSelMkt={setSelMkt}
                  setMainView={setMainView}
               />
            )}

            {mainView === 'compare' && !selMkt && (
               <CompareHubView
                  L={L}
                  compareIds={compareIds}
                  filteredMandis={ALL_MANDIS}
                  mktStats={mktStats}
                  mktData={mktData}
                  CROPS={CROPS}
                  setMainView={setMainView}
               />
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
                           <button className={activeTab === 'rates' ? 'on' : ''} onClick={() => setActiveTab('rates')}>📈 {L === 'mr' ? 'बाजार भाव' : 'Live Rates'}</button>
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
                              <form className="sb-broadcast-form" onSubmit={async (e) => {
                                 e.preventDefault();
                                 const msg = e.target.msg.value;
                                 if (!msg) return;
                                 const res = await api.addMandiAlert({ mandiId: selMkt.id, text: msg });
                                 if (!res.error) {
                                    setMktOverrides({ ...mktOverrides, alerts: [res, ...mktOverrides.alerts] });
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
                                    if (!c) return null;

                                     // Use dynamic overrides or fallback to static base data
                                     const pData = mktOverrides.prices[cid];
                                     const basePrice = pData?.modal || c.base;
                                     const fluctuation = parseInt(livePriceFluctuations[cid] || 0);
                                     const modalPrice = basePrice + fluctuation;
                                     const maxPrice = pData?.max || (Math.floor(modalPrice * 1.08) + Math.abs(fluctuation));
                                     const arrival = pData?.arrival || (Math.floor((modalPrice % 100) * 2) + 40);
                                     const isFallback = pData?.isFallback;
                                     const lastUpdate = pData?.lastUpdate || 'Live';
                                     const trend = pData?.status || 'stable';

                                     return (
                                        <div key={cid} className={`mh-crop-p-card ${isFallback ? 'fallback' : ''}`} onClick={() => setSelCropId(cid)}>
                                           <div className="mcp-header">
                                              <div className={`mcp-badge live ${trend}`}><span className="mcp-live-dot pulsate" />{trend === 'bullish' ? '▲ ' : ''}{L === 'mr' ? 'थेट' : 'LIVE'}</div>
                                              <div className="mcp-update-ts">{lastUpdate}</div>
                                              {isFallback && <div className="mcp-fallback-tag">{L === 'mr' ? 'जवळपासचा कल' : 'Nearby Trend'}</div>}
                                             <div className={`mcp-badge live ${trend}`}><span className="mcp-live-dot pulsate" />{trend === 'bullish' ? '▲ ' : ''}{L === 'mr' ? 'थेट' : 'LIVE'}</div>
                                             <div className="mcp-update-ts">{lastUpdate}</div>
                                             {isFallback && <div className="mcp-fallback-tag">{L === 'mr' ? 'जवळपासचा कल' : 'Nearby Trend'}</div>}
                                             {isStaffLoggedIn && (
                                                <button className="mcp-edit-btn" onClick={(e) => {
                                                   e.stopPropagation();
                                                   const val = prompt(`${c[L]} नवीन भाव:`, modalPrice);
                                                   if (val) {
                                                      const newVal = parseInt(val);
                                                      api.updateMandiPrice({ mandiId: selMkt.id, cropId: cid, modal: newVal });
                                                      updateMktOverrides({
                                                         ...mktOverrides,
                                                         prices: { ...mktOverrides.prices, [cid]: { modal: newVal } }
                                                      });
                                                      setLastAction(L === 'mr' ? "भाव अपडेट झाला!" : "Price Updated!");
                                                      setTimeout(() => setLastAction(null), 3000);
                                                   }
                                                }}>✏️</button>
                                             )}
                                          </div>
                                          <div className="mcp-img"><span className="mcp-crop-emoji">{c.icon}</span></div>
                                          <div className="mcp-crop-title"><h4>{c[L]}</h4></div>
                                          <div className="mcp-price-main"><span>₹{modalPrice.toLocaleString()}</span><small>/Q</small></div>
                                          <div className="apmc-mini-stats">
                                             <div className="ams-item"><b>₹{maxPrice.toLocaleString()}</b><small>MAX</small></div>
                                             <div className="ams-item"><b>{arrival} Q</b><small>ARR</small></div>
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

                        {activeTab === 'logistics' && (
                           <div className="mh-elite-feature-view animate-in">
                              <div className="ef-label">🚛 {L === 'mr' ? 'प्रगत वाहन व गेट मॅनेजमेंट' : 'Advanced Vehicle & Gate Management'}</div>

                              {isStaffLoggedIn && (
                                 <div className="admin-logistics-premium-hub animate-in">
                                    <div className="ale-radar-card">
                                       <div className="radar-circle">
                                          <div className="radar-pulse"></div>
                                          <div className="radar-scanner"></div>
                                          <div className="radar-monitor-data">
                                             <span className="rm-v-id">{processingReq?.id || authorityLog[0]?.id || 'SCANNING...'}</span>
                                             <span className="rm-v-driver">{processingReq ? processingReq.driver : (authorityLog[0]?.driver || 'DRIVER')}</span>
                                          </div>
                                       </div>
                                       <div className="radar-info">
                                          <label className="radar-badge">{processingReq ? 'READY TO PROCESS' : 'NOW PASSING'}</label>
                                          <div className="radar-type">{processingReq?.type || authorityLog[0]?.type || 'WAITING...'}</div>
                                       </div>
                                    </div>

                                    <div className="ale-form-premium glass-card">
                                       <form className="ale-form-pro" onSubmit={(e) => {
                                          e.preventDefault();
                                          setIsPaying(true);
                                          const vnum = e.target.vnum.value.toUpperCase();
                                          const newEntry = {
                                             id: vnum,
                                             driver: e.target.vdriver.value,
                                             type: e.target.vtype.value,
                                             crop: e.target.vcrop.value,
                                             wt: e.target.vwt.value + ' Q',
                                             inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                             status: 'inside',
                                             pay: 'paid',
                                             payMode: e.target.vpay.value,
                                             fee: '₹50.00'
                                          };
                                          setTimeout(() => {
                                             updateMktLog([newEntry, ...authorityLog]);
                                             setIsPaying(false);
                                             e.target.reset();
                                             setLastAction(L === 'mr' ? "एन्ट्री नोंदली गेली! ✅" : "Gate Entry Recorded! ✅");
                                             setTimeout(() => setLastAction(null), 3000);
                                          }, 1500);
                                       }}>
                                          <div className="ale-form-grid">
                                             <div className="ale-field">
                                                <label>{L === 'mr' ? 'वाहन क्र.' : 'Vehicle No'}</label>
                                                <input name="vnum" placeholder="MH-12-AB-1234" required />
                                             </div>
                                             <div className="ale-field">
                                                <label>{L === 'mr' ? 'चालक' : 'Driver'}</label>
                                                <input name="vdriver" placeholder="Rajesh P." required />
                                             </div>
                                             <div className="ale-field">
                                                <label>{L === 'mr' ? 'प्रकार' : 'Type'}</label>
                                                <select name="vtype">
                                                   <option value="🚛 Truck">Truck</option>
                                                   <option value="🚜 Tractor">Tractor</option>
                                                   <option value="🚐 Tempo">Tempo</option>
                                                   <option value="🚗 Car">Car</option>
                                                   <option value="🏍️ Bike">Bike</option>
                                                   <option value="🚶 Pedestrian">Pedestrian</option>
                                                   <option value="other">Other</option>
                                                </select>
                                             </div>
                                             <div className="ale-field">
                                                <label>{L === 'mr' ? 'शेतमाल' : 'Crop'}</label>
                                                <input name="vcrop" placeholder="कांदा / Onion" required />
                                             </div>
                                             <div className="ale-field">
                                                <label>{L === 'mr' ? 'वजन (Q)' : 'Weight (Q)'}</label>
                                                <input name="vwt" type="number" placeholder="45" required />
                                             </div>
                                             <div className="ale-field">
                                                <label>{L === 'mr' ? 'पेमेंट मोड' : 'Payment Mode'}</label>
                                                <select name="vpay">
                                                   <option value="UPI">📱 UPI/QR</option>
                                                   <option value="Cash">💵 CASH</option>
                                                </select>
                                             </div>
                                             <div className="ale-field fee-highlight">
                                                <label>{L === 'mr' ? 'पावती शुल्क' : 'Pass Fee'}</label>
                                                <div className="fee-amount">₹50.00</div>
                                             </div>
                                          </div>
                                          <button type="submit" className={`ale-submit-pro ${isPaying ? 'loading' : ''}`} disabled={isPaying}>
                                             {isPaying ? 'Processing...' : (L === 'mr' ? 'नोंदणी व पेमेंट करा' : 'Register & Pay')}
                                          </button>
                                       </form>
                                    </div>
                                 </div>
                              )}

                              {userRole === 'farmer' && (
                                 <div className="farmer-logistics-hub animate-in">
                                    <div className="farmer-log-tabs">
                                       <button className={farmerLogTab === 'pass' ? 'active' : ''} onClick={() => setFarmerLogTab('pass')}>
                                          🎫 {L === 'mr' ? 'पास मिळवा' : 'E-Pass Milva'}
                                       </button>
                                       <button className={farmerLogTab === 'history' ? 'active' : ''} onClick={() => setFarmerLogTab('history')}>
                                          📜 {L === 'mr' ? 'पूर्व नोंदणी' : 'Purv Order'}
                                       </button>
                                    </div>

                                    {farmerLogTab === 'pass' && (
                                       <div className="flh-pass-view animate-in">
                                          {!gatePass ? (
                                             <div className="flh-form-container glass-card">
                                                <div className="flh-form-header">
                                                   <h5>📝 {L === 'mr' ? 'नव्या पाससाठी नोंदणी' : 'Gate Pass Registration'}</h5>
                                                   <p>{L === 'mr' ? 'कृपया माहिती अचूक भरा' : 'Please fill accurate details'}</p>
                                                </div>
                                                <form className="flh-form-pro" onSubmit={async (e) => {
                                                   e.preventDefault();
                                                   const btn = e.target.querySelector('button');
                                                   const token = localStorage.getItem('agro_token');
                                                   if (!token) {
                                                      return alert(L === 'mr' ? 'कृपया प्रथम लॉगिन करा' : 'Please login first');
                                                   }
                                                   btn.disabled = true;
                                                   btn.innerText = L === 'mr' ? 'प्रक्रिया सुरू आहे...' : 'Processing...';

                                                   const formData = {
                                                      driverName: e.target.vdriver.value,
                                                      vehicleNo: e.target.vnum.value.toUpperCase(),
                                                      cropName: e.target.vcrop?.value || 'Cotton',
                                                      quantity: (e.target.vwt?.value || '20') + ' Q',
                                                      contact: 'Farmer',
                                                      mandiId: selMkt.id
                                                   };

                                                   const res = await api.addLogisticsRequest(token, formData);

                                                   if (!res.error) {
                                                      updateMktRequests([res, ...pendingRequests]);
                                                      setGatePass({ ...res, userId });
                                                      setLastAction(L === 'mr' ? "विनंती पाठवली! मंजुरीची वाट पहा. ⏳" : "Request Sent! Waiting for Approval. ⏳");
                                                      setTimeout(() => setLastAction(null), 3000);
                                                   } else {
                                                      alert(res.error);
                                                      btn.disabled = false;
                                                      btn.innerText = L === 'mr' ? 'नोंदणी विनंती पाठवा' : 'Send Registration Request';
                                                   }
                                                }}>
                                                   <div className="ale-form-grid">
                                                      <div className="ale-field">
                                                         <label>{L === 'mr' ? 'वाहन क्र.' : 'Vehicle No'}</label>
                                                         <input name="vnum" placeholder="MH-12-AB-1234" required />
                                                      </div>
                                                      <div className="ale-field">
                                                         <label>{L === 'mr' ? 'चालक' : 'Driver'}</label>
                                                         <input name="vdriver" placeholder="Rajesh P." required />
                                                      </div>
                                                      <div className="ale-field">
                                                         <label>{L === 'mr' ? 'प्रकार' : 'Type'}</label>
                                                         <select name="vtype">
                                                            <option value="🚛 Truck">Truck</option>
                                                            <option value="🚜 Tractor">Tractor</option>
                                                            <option value="🚐 Tempo">Tempo</option>
                                                         </select>
                                                      </div>
                                                      <div className="ale-field">
                                                         <label>{L === 'mr' ? 'शेतमाल/Crop' : 'Crop'}</label>
                                                         <input name="vcrop" placeholder="कांदा / Onion" required />
                                                      </div>
                                                      <div className="ale-field">
                                                         <label>{L === 'mr' ? 'वजन (Q)' : 'Weight (Q)'}</label>
                                                         <input name="vwt" type="number" placeholder="45" required />
                                                      </div>
                                                   </div>
                                                   <button type="submit" className="btn-request-entry">🚀 {L === 'mr' ? 'नोंदणी विनंती पाठवा' : 'Send Registration Request'}</button>
                                                </form>
                                             </div>
                                          ) : (
                                             <div className="digital-gate-pass glass-card animate-in">
                                                <div className="dgp-header">
                                                   <div className="dgp-mkt-info">
                                                      <h5>{selMkt.name[L]} APMC</h5>
                                                      <span>{L === 'mr' ? 'अधिकृत गेट पास' : 'Official Gate Pass'}</span>
                                                   </div>
                                                   <div className="dgp-qr-visual">
                                                      {livePass.status === 'ready_for_payment' || livePass.status === 'inside' ? (
                                                         <div className="dgp-qr-dummy-box animate-in">
                                                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${livePass.vehicleNo || livePass.id}`} alt="QR" />
                                                            <small>{L === 'mr' ? 'स्कॅन करा' : 'Scan'}</small>
                                                         </div>
                                                      ) : (
                                                         <div className="dgp-qr-static">QR</div>
                                                      )}
                                                   </div>
                                                </div>
                                                <div className="dgp-body">
                                                   <div className="dgp-row">
                                                      <div className="dgp-col">
                                                         <label>{L === 'mr' ? 'वजन' : 'Weight'}</label>
                                                         <b>{livePass.weight || livePass.wt || gatePass?.weight || gatePass?.wt || '---'}</b>
                                                      </div>
                                                   </div>
                                                </div>
                                                <div className="dgp-footer">
                                                   {livePass.status === 'pending' && (
                                                      <div className="dgp-msg-box pending">
                                                         <span className="pulse-dot"></span>
                                                         <p>{L === 'mr' ? 'प्रशासकीय मंजुरीची वाट पाहत आहे...' : 'Awaiting Administrative Approval...'}</p>
                                                      </div>
                                                   )}
                                                   {livePass.status === 'ready_for_payment' && (
                                                      <div className="dgp-payment-action">
                                                         <div className="dgp-fee-note">
                                                            <label>{L === 'mr' ? 'फी भरा' : 'Payment Due'}</label>
                                                            <span>{livePass.fee || '₹50'}</span>
                                                         </div>
                                                         <button className="btn-pay-premium" onClick={() => {
                                                            setPendingV(livePass);
                                                            setShowPhonePe(true);
                                                         }}>
                                                            📱 {L === 'mr' ? 'पेमेंट करून पास मिळवा' : 'Pay & Get Pass'}
                                                         </button>
                                                      </div>
                                                   )}
                                                   {livePass.status === 'inside' && (
                                                      <div className="dgp-active-actions">
                                                         <div className="dgp-active-badge">
                                                            <i className="check-icon">✅</i>
                                                            <span>{L === 'mr' ? 'पास सक्रिय - गेटवर स्कॅन करा' : 'Pass Active - Scan at Gate'}</span>
                                                         </div>
                                                         <button className="btn-farmer-exit" onClick={async () => {
                                                            const outTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                            try {
                                                               const updatedLog = await api.updateMandiLogStatus(livePass._id || livePass.id, 'out', outTime);
                                                               const finalVisit = { ...livePass, ...updatedLog, outTime, status: 'out' };
                                                               updateMktLog(authorityLog.map(item => (item._id === livePass._id || item.id === livePass.id) ? finalVisit : item));
                                                               setCompletedVisit(finalVisit);
                                                               setGatePass(null);
                                                            } catch (err) { console.error(err); }
                                                         }}>
                                                            🚪 {L === 'mr' ? 'गेटमधून बाहेर पडा' : 'Exit Gate'}
                                                         </button>
                                                      </div>
                                                   )}
                                                   {livePass.status === 'out' && (
                                                      <div className="dgp-out-action" style={{ marginTop: '15px' }}>
                                                         <button className="btn-pay-premium" onClick={() => setGatePass(null)}>
                                                            🔄 {L === 'mr' ? 'नवीन पास काढा' : 'Start New Entry'}
                                                         </button>
                                                      </div>
                                                   )}
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                    )}

                                    {farmerLogTab === 'history' && (
                                       <div className="flh-history-view animate-in">
                                          <div className="history-header">
                                             <h5>📜 {L === 'mr' ? 'तुमचा इतिहास' : 'Your Visit History'}</h5>
                                          </div>
                                          <div className="history-list">
                                             {filteredLog.length === 0 ? (
                                                <p className="empty-msg">{L === 'mr' ? 'इतिहास कोरा आहे.' : 'History is empty.'}</p>
                                             ) : (
                                                filteredLog.map((item, idx) => (
                                                   <div key={idx} className="history-item glass-card" onClick={() => setCompletedVisit(item)} style={{ cursor: 'pointer' }}>
                                                      <div className="hi-left">
                                                         <b>{item.vehicleNo || item.id}</b>
                                                         <span>{item.crop} • {item.weight || item.wt}</span>
                                                      </div>
                                                      <div className="hi-right">
                                                         <span className="hi-date">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''} {item.inTime || item.ts}</span>
                                                         <span className={`hi-status ${item.status}`}>{item.status.toUpperCase()}</span>
                                                      </div>
                                                   </div>
                                                ))
                                             )}
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              )}

                              {(() => {
                                 const insideCount = authorityLog.filter(v => v.status === 'inside').length;
                                 const trafficPercent = Math.min(Math.max((insideCount / 100) * 100, 0), 100);
                                 const waitTime = Math.max(insideCount * 0.2, 5).toFixed(0);
                                 const radius = 70;
                                 const circ = 2 * Math.PI * radius;
                                 const offset = circ - (trafficPercent / 100) * circ;
                                 const isHigh = trafficPercent > 70;


                                 return (
                                    <div className={`gate-gauge-circular-wrap ${isHigh ? 'busy' : 'smooth'}`}>
                                       <div className="ggc-main">
                                          <svg width="180" height="180" viewBox="0 0 180 180">
                                             <defs>
                                                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                   <stop offset="0%" stopColor={isHigh ? "#f59e0b" : "#10b981"} />
                                                   <stop offset="100%" stopColor={isHigh ? "#ef4444" : "#3b82f6"} />
                                                </linearGradient>
                                                <filter id="glow">
                                                   <feGaussianBlur stdDeviation="3" result="blur" />
                                                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                                </filter>
                                             </defs>
                                             <circle
                                                cx="90" cy="90" r={radius}
                                                fill="none" stroke="rgba(255,255,255,0.05)"
                                                strokeWidth="12"
                                             />
                                             <circle
                                                cx="90" cy="90" r={radius}
                                                fill="none"
                                                stroke="url(#gaugeGradient)"
                                                strokeWidth="12"
                                                strokeDasharray={circ}
                                                strokeDashoffset={offset}
                                                strokeLinecap="round"
                                                filter="url(#glow)"
                                                style={{ transition: 'stroke-dashoffset 1s ease-out', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                             />
                                          </svg>
                                          <div className="ggc-data">
                                             <span className="ggc-val">{insideCount}</span>
                                             <label>{L === 'mr' ? 'गाड्या आत' : 'Inside'}</label>
                                          </div>
                                       </div>
                                       <div className="ggc-side-stats">
                                          <div className="ggc-stat-box">
                                             <b>{waitTime}m</b>
                                             <label>{L === 'mr' ? 'प्रतिक्षा' : 'Wait'}</label>
                                          </div>
                                          <div className={`ggc-status-pill ${isHigh ? 'high' : 'ok'}`}>
                                             {isHigh ? (L === 'mr' ? 'गर्दी जास्त' : 'BUSY') : (L === 'mr' ? 'सुरळीत' : 'SMOOTH')}
                                          </div>
                                       </div>
                                    </div>
                                 );
                              })()}

                              {isStaffLoggedIn && (
                                 <div className="ef-table-wrap logistics-pro">
                                    <div className="log-view-tabs">
                                       <button className={adminLogView === 'pending' ? 'active' : ''} onClick={() => setAdminLogView('pending')}>
                                          📩 {L === 'mr' ? 'विनंती' : 'Requests'}
                                          {pendingRequests.length > 0 && <span className="tab-badge">{pendingRequests.length}</span>}
                                       </button>
                                       <button className={adminLogView === 'entry' ? 'active' : ''} onClick={() => setAdminLogView('entry')}>
                                          📝 {L === 'mr' ? 'थेट एन्ट्री' : 'Direct Entry'}
                                       </button>
                                       <button className={adminLogView === 'active' ? 'active' : ''} onClick={() => setAdminLogView('active')}>
                                          🚛 {L === 'mr' ? 'सक्रिय' : 'Active'}
                                       </button>
                                    </div>

                                    {adminLogView === 'entry' && (
                                       <div className="admin-direct-entry-view animate-in">
                                          <form className="ale-form-pro" onSubmit={(e) => {
                                             e.preventDefault();
                                             setIsPaying(true);
                                             const vnum = e.target.vnum.value.toUpperCase();
                                             const newEntry = {
                                                id: vnum,
                                                driver: e.target.vdriver.value,
                                                type: e.target.vtype.value,
                                                crop: e.target.vcrop.value,
                                                wt: e.target.vwt.value + ' Q',
                                                inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                status: 'inside',
                                                pay: 'paid',
                                                payMode: e.target.vpay.value,
                                                fee: '₹50.00'
                                             };
                                             setTimeout(() => {
                                                updateMktLog([newEntry, ...authorityLog]);
                                                setIsPaying(false);
                                                e.target.reset();
                                                setLastAction(L === 'mr' ? "एन्ट्री नोंदली गेली! ✅" : "Gate Entry Recorded! ✅");
                                                setTimeout(() => setLastAction(null), 3000);
                                             }, 1500);
                                          }}>
                                             <div className="ale-form-grid">
                                                <div className="ale-field">
                                                   <label>{L === 'mr' ? 'वाहन क्र.' : 'Vehicle No'}</label>
                                                   <input name="vnum" placeholder="MH-12-AB-1234" required />
                                                </div>
                                                <div className="ale-field">
                                                   <label>{L === 'mr' ? 'चालक' : 'Driver'}</label>
                                                   <input name="vdriver" placeholder="Rajesh P." required />
                                                </div>
                                                <div className="ale-field">
                                                   <label>{L === 'mr' ? 'प्रकार' : 'Type'}</label>
                                                   <select name="vtype">
                                                      <option value="🚛 Truck">Truck</option>
                                                      <option value="🚜 Tractor">Tractor</option>
                                                      <option value="🚐 Tempo">Tempo</option>
                                                      <option value="🚗 Car">Car</option>
                                                      <option value="🏍️ Bike">Bike</option>
                                                      <option value="🚶 Pedestrian">Pedestrian</option>
                                                      <option value="other">Other</option>
                                                   </select>
                                                </div>
                                                <div className="ale-field">
                                                   <label>{L === 'mr' ? 'शेतमाल' : 'Crop'}</label>
                                                   <input name="vcrop" placeholder="कांदा / Onion" required />
                                                </div>
                                                <div className="ale-field">
                                                   <label>{L === 'mr' ? 'वजन (Q)' : 'Weight (Q)'}</label>
                                                   <input name="vwt" type="number" placeholder="45" required />
                                                </div>
                                                <div className="ale-field">
                                                   <label>{L === 'mr' ? 'पेमेंट मोड' : 'Payment Mode'}</label>
                                                   <select name="vpay">
                                                      <option value="UPI">📱 UPI/QR</option>
                                                      <option value="Cash">💵 CASH</option>
                                                   </select>
                                                </div>
                                             </div>
                                             <button type="submit" className={`ale-submit-pro ${isPaying ? 'loading' : ''}`} disabled={isPaying}>
                                                🚀 {isPaying ? (L === 'mr' ? 'प्रक्रिया सुरू आहे...' : 'Processing...') : (L === 'mr' ? 'एन्ट्री करा' : 'Submit Entry')}
                                             </button>
                                          </form>
                                       </div>
                                    )}

                                    {adminLogView === 'pending' ? (
                                       <div className="pending-queue-view animate-in">
                                          {processingReq ? (
                                             <div className="admin-process-card glass-card animate-in">
                                                <div className="apc-header">
                                                   <h4>📜 {L === 'mr' ? 'विनंती प्रक्रिया (Read & Proceed)' : 'Process Request'}</h4>
                                                   <button className="btn-close-apc" onClick={() => setProcessingReq(null)}>✕</button>
                                                </div>
                                                <div className="apc-body">
                                                   <div className="apc-details">
                                                      <div className="apc-det-item"><label>Vehicle:</label> <b>{processingReq.vehicleNo || processingReq.id}</b></div>
                                                      <div className="apc-det-item"><label>Driver:</label> <span>{processingReq.driverName || processingReq.driver}</span></div>
                                                      <div className="apc-det-item"><label>Crop:</label> <span>{processingReq.cropName || processingReq.crop}</span></div>
                                                      <div className="apc-det-item"><label>Weight:</label> <span>{processingReq.quantity || processingReq.wt}</span></div>
                                                   </div>
                                                   <div className="apc-payment-gen">
                                                      <label>💰 {L === 'mr' ? 'पेमेंट रक्कम जनरेट करा' : 'Generate Payment Amount'}</label>
                                                      <div className="apc-input-row">
                                                         <span className="currency-prefix">₹</span>
                                                         <input
                                                            type="number"
                                                            value={genAmount}
                                                            onChange={e => setGenAmount(e.target.value)}
                                                            placeholder="50"
                                                         />
                                                      </div>
                                                      <div className="apc-actions">
                                                         <button className="btn-gen-pay-qr" onClick={async () => {
                                                            try {
                                                               const updatedReq = await api.updateLogisticsStatus(processingReq._id, 'ready_for_payment', `₹${genAmount}`);
                                                               updateMktRequests(pendingRequests.map(r => r._id === processingReq._id ? updatedReq : r));
                                                               setProcessingReq(null);
                                                               setLastAction(L === 'mr' ? "QR पेमेंट विनंती पाठवली!" : "QR Payment Request Sent!");
                                                               setTimeout(() => setLastAction(null), 3000);
                                                            } catch (err) { console.error(err); }
                                                         }}>🚀 {L === 'mr' ? 'QR पेमेंट पाठवा' : 'Send Payment QR'}</button>

                                                         <button className="btn-direct-cash" onClick={async () => {
                                                            try {
                                                               await api.updateLogisticsStatus(processingReq._id, 'Approved');
                                                               const inTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                               const resLog = await api.addMandiLog({
                                                                  mandiId: selMkt.id,
                                                                  vehicleNo: processingReq.vehicleNo || processingReq.id,
                                                                  driver: processingReq.driverName || processingReq.driver,
                                                                  type: '🚛 Truck',
                                                                  crop: processingReq.cropName || processingReq.crop,
                                                                  weight: processingReq.quantity || processingReq.wt,
                                                                  status: 'inside',
                                                                  payStatus: 'paid',
                                                                  fee: `₹${genAmount}.00`,
                                                                  inTime: inTime
                                                               });
                                                               updateMktLog([resLog, ...authorityLog]);
                                                               updateMktRequests(pendingRequests.filter(r => r._id !== processingReq._id));
                                                               setProcessingReq(null);
                                                               setLastAction(L === 'mr' ? "कॅश पेमेंट नोंदले! एंट्री दिली." : "Cash Noted! Entry Granted.");
                                                               setTimeout(() => setLastAction(null), 3000);
                                                            } catch (err) { console.error(err); }
                                                         }}>💵 {L === 'mr' ? 'कॅश स्वीकारली' : 'Direct Cash'}</button>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          ) : (
                                             <>
                                                {pendingRequests.length === 0 ? (
                                                   <div className="empty-queue-msg">{L === 'mr' ? 'प्रलंबित विनंत्या नाहीत.' : 'No pending requests.'}</div>
                                                ) : (
                                                   <table className="ef-table pending">
                                                      <thead>
                                                         <tr>
                                                            <th>{L === 'mr' ? 'वाहन' : 'Vehicle'}</th>
                                                            <th>{L === 'mr' ? 'चालक' : 'Driver'}</th>
                                                            <th>{L === 'mr' ? 'स्थिती' : 'Status'}</th>
                                                            <th>{L === 'mr' ? 'क्रिया' : 'Action'}</th>
                                                         </tr>
                                                      </thead>
                                                      <tbody>
                                                         {pendingRequests.map((r) => (
                                                            <tr key={r._id || r.id || Math.random()}>
                                                               <td><b>{r.vehicleNo || r.id}</b></td>
                                                               <td>{r.driverName || r.driver}</td>
                                                               <td>
                                                                  {r.status === 'ready_for_payment' ?
                                                                     <span className="status-pill awaits-pay">⏳ {L === 'mr' ? 'पेमेंट बाकी' : 'Pay Pending'}</span> :
                                                                     <span className="status-pill new-req">📩 {L === 'mr' ? 'नवीन' : 'New'}</span>
                                                                  }
                                                               </td>
                                                               <td>
                                                                  <div className="admin-row-actions">
                                                                     <button className="btn-read-req" onClick={() => setProcessingReq(r)}>
                                                                        👁️ {L === 'mr' ? 'पहा' : 'Read'}
                                                                     </button>
                                                                     {r.status !== 'ready_for_payment' && (
                                                                        <button className="btn-read-proceed" onClick={() => {
                                                                           setProcessingReq(r);
                                                                           setGenAmount('50');
                                                                        }}>
                                                                           ⚡ {L === 'mr' ? 'Proceed' : 'Proceed'}
                                                                        </button>
                                                                     )}
                                                                  </div>
                                                               </td>
                                                            </tr>
                                                         ))}
                                                      </tbody>
                                                   </table>
                                                )}
                                             </>
                                          )}
                                       </div>
                                    ) : (
                                       <div className="active-log-view animate-in">
                                          <div className="alv-header">
                                             <h5>🚛 {L === 'mr' ? 'सक्रिय वाहन नोंद' : 'Active Vehicle Log'}</h5>
                                             <div className="alv-search">
                                                <input
                                                   type="text"
                                                   placeholder={L === 'mr' ? 'वाहन क्र. किंवा चालकाने शोधा...' : 'Search by Vehicle or Driver...'}
                                                   value={adminSearch}
                                                   onChange={(e) => setAdminSearch(e.target.value)}
                                                />
                                                <i className="search-icon">🔍</i>
                                             </div>
                                          </div>
                                          <table className="ef-table pro">
                                             <thead>
                                                <tr>
                                                   <th>{L === 'mr' ? 'वाहन क्र.' : 'Vehicle No'}</th>
                                                   <th>{L === 'mr' ? 'चालक' : 'Driver'}</th>
                                                   <th>{L === 'mr' ? 'शेतमाल' : 'Crop'}</th>
                                                   <th>{L === 'mr' ? 'वजन' : 'Weight'}</th>
                                                   <th>{L === 'mr' ? 'एंट्री' : 'In Time'}</th>
                                                   <th>{L === 'mr' ? 'स्थिती' : 'Status'}</th>
                                                   <th>{L === 'mr' ? 'पेमेंट' : 'Payment'}</th>
                                                   <th>{L === 'mr' ? 'क्रिया' : 'Action'}</th>
                                                </tr>
                                             </thead>
                                             <tbody>
                                                {authorityLog.filter(v =>
                                                   (v.vehicleNo || v.id || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
                                                   (v.driverName || v.driver || '').toLowerCase().includes(adminSearch.toLowerCase())
                                                ).map((v, i) => (
                                                   <tr key={v._id || v.vehicleNo || v.id || i}>
                                                      <td className="entry-id"><b>{v.vehicleNo || v.vehicleNo || v.id}</b></td>
                                                      <td>{v.driverName || v.driverName || v.driverName || v.driver}</td>
                                                      <td>{v.cropName || v.cropName || v.cropName || v.crop}</td>
                                                      <td>{v.quantity || v.quantity || v.wt}</td>
                                                      <td>{v.inTime || (v.createdAt ? new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--')}</td>
                                                      <td>
                                                         {v.status === 'ready_for_payment' && <span className="status-pill pending-pay">⏳ {L === 'mr' ? 'पेमेंट बाकी' : 'Pay Pending'}</span>}
                                                         {v.status === 'inside' && <span className="status-pill inside">✅ {L === 'mr' ? 'आत' : 'Inside'}</span>}
                                                         {v.status === 'out' && <span className="status-pill out">🚪 {L === 'mr' ? 'बाहेर' : 'Out'}</span>}
                                                      </td>
                                                      <td>
                                                         {v.pay === 'paid' ?
                                                            <span className="pay-status paid">✅ {v.fee || '₹50'} ({v.payMode || 'UPI'})</span> :
                                                            <span className="pay-status unpaid">💳 {v.fee || '₹50'} {L === 'mr' ? 'बाकी' : 'Due'}</span>
                                                         }
                                                      </td>
                                                      <td>
                                                         {v.status === 'inside' && (
                                                            <button className="btn-exit-auth" onClick={async () => {
                                                               const outTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                               try {
                                                                  const res = await api.updateMandiLogStatus(v._id || v.id, 'out', outTime);
                                                                  updateMktLog(authorityLog.map(item => (item._id === v._id || item.id === v.id) ? { ...item, ...res, status: 'out', outTime } : item));
                                                                  setLastAction(L === 'mr' ? "वाहन बाहेर पडले!" : "Vehicle Marked as Out!");
                                                                  setTimeout(() => setLastAction(null), 3000);
                                                               } catch (err) { console.error('Admin exit error:', err); }
                                                            }}>
                                                               🚪 {L === 'mr' ? 'बाहेर काढा' : 'Exit'}
                                                            </button>
                                                         )}
                                                      </td>
                                                   </tr>
                                                ))}
                                             </tbody>
                                          </table>
                                       </div>
                                    )}
                                 </div>
                              )}

                           </div>
                        )}
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
                                       <p>{pendingV?.fee || '₹50'} {L === 'mr' ? 'बाजार समितीला पाठवले' : 'Sent to APMC'}</p>
                                    </div>
                                 ) : (
                                    <div className="pp-body">
                                       <div className="pp-amount-card">
                                          <span>{L === 'mr' ? 'देय रक्कम' : 'Amount to Pay'}</span>
                                          <h2>{pendingV?.fee || '₹50'}</h2>
                                       </div>
                                       <div className="pp-upi-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', padding: '20px' }}>
                                          <div className="pp-option-v2" onClick={() => triggerUPI('phonepe')} style={{ cursor: 'pointer', textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '12px' }}>
                                             <img src="https://img.icons8.com/color/48/000000/phonepe.png" alt="PhonePe" style={{ width: '32px' }} />
                                             <div style={{ fontSize: '10px', marginTop: '5px' }}>PhonePe</div>
                                          </div>
                                          <div className="pp-option-v2" onClick={() => triggerUPI('gpay')} style={{ cursor: 'pointer', textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '12px' }}>
                                             <img src="https://img.icons8.com/color/48/000000/google-pay.png" alt="GPay" style={{ width: '32px' }} />
                                             <div style={{ fontSize: '10px', marginTop: '5px' }}>GPay</div>
                                          </div>
                                          <div className="pp-option-v2" onClick={() => triggerUPI('paytm')} style={{ cursor: 'pointer', textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '12px' }}>
                                             <img src="https://img.icons8.com/color/48/000000/paytm.png" alt="Paytm" style={{ width: '32px' }} />
                                             <div style={{ fontSize: '10px', marginTop: '5px' }}>Paytm</div>
                                          </div>
                                       </div>
                                       <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`upi://pay?pa=9890553011@ybl&pn=APMC%20Office&am=${pendingV?.fee?.replace(/[^0-9]/g, '') || 50}&cu=INR`)}`} alt="QR" style={{ width: '80px', opacity: 0.6 }} />
                                          <p style={{ fontSize: '10px', color: '#666', marginTop: '5px' }}>{L === 'mr' ? 'किंवा QR स्कॅन करा' : 'Or scan QR code'}</p>
                                       </div>
                                       <button className="pp-pay-btn" onClick={() => triggerUPI('generic')}>
                                          {L === 'mr' ? 'पेमेंट सुरू करा' : 'Proceed to Pay'}
                                       </button>
                                    </div>
                                 )}
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            ) : null}

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
                              onKeyDown={async (e) => {
                                 if (e.key === 'Enter') {
                                    if (selMkt && staffIdInput.startsWith('APMC')) {
                                       const res = await api.staffLogin({ staffId: staffIdInput, pin: staffPinInput, mandiId: selMkt.id });
                                       if (res.success) {
                                          handleStaffLogin(true);
                                          setShowAuthModal(false);
                                       } else {
                                          alert(res.error || (L === 'mr' ? 'चुकीचा आयडी किंवा पिन!' : 'Invalid ID or PIN!'));
                                       }
                                    } else {
                                       alert(L === 'mr' ? 'चुकीचा आयडी!' : 'Invalid ID!');
                                    }
                                 }
                              }}
                           />
                        </div>
                     </div>
                     <div className="amc-footer">
                        <button className="amc-login-btn-final" onClick={async () => {
                           if (selMkt && staffIdInput.startsWith('APMC')) {
                              const res = await api.staffLogin({ staffId: staffIdInput, pin: staffPinInput, mandiId: selMkt.id });
                              if (res.success) {
                                 handleStaffLogin(true);
                                 setShowAuthModal(false);
                              } else {
                                 alert(res.error || (L === 'mr' ? 'चुकीचा आयडी किंवा पिन!' : 'Invalid ID or PIN!'));
                              }
                           } else {
                              alert(L === 'mr' ? 'चुकीचा आयडी!' : 'Invalid ID!');
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
                           <h3>#MKT-{(completedVisit.id || completedVisit._id || '').toString().replace(/-/g, '')}</h3>
                        </div>

                        <div className="receipt-grid">
                           <div className="r-item">
                              <label>{L === 'mr' ? 'वाहन क्र.' : 'Vehicle No'}</label>
                              <b>{completedVisit.vehicleNo || completedVisit.id}</b>
                           </div>
                           <div className="r-item">
                              <label>{L === 'mr' ? 'शेतमाल' : 'Crop'}</label>
                              <b>{completedVisit.cropName || completedVisit.crop}</b>
                           </div>
                           <div className="r-item">
                              <label>{L === 'mr' ? 'एंट्री' : 'Entry'}</label>
                              <b>{completedVisit.inTime || (completedVisit.createdAt ? new Date(completedVisit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---')}</b>
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

         {/* 🔴 STICKY ACTION BAR */}
         {(compareIds.length > 0 || favIds.length > 0) && !selMkt && mainView === 'home' && (
            <div className="mh-sticky-action-bar animate-in">
               {compareIds.length > 0 && (
                  <button className="stick-cmp" onClick={() => setMainView('compare')}>
                     ⚖️ {compareIds.length} {L === 'mr' ? 'निवडलेले बाजार (तुलना करा)' : 'Selected Markets (Compare)'}
                  </button>
               )}
               {favIds.length > 0 && (
                  <button className="stick-fav" onClick={() => setMainView('fav')}>
                     ❤️ {favIds.length} {L === 'mr' ? 'आवडते पहा' : 'View Favorites'}
                  </button>
               )}
            </div>
         )}
      </div>
   );
}
