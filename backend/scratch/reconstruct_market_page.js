const fs = require('fs');
const path = 'src/components/MarketPage.js';
const lines = fs.readFileSync(path, 'utf8').split('\n');

// 1. Keep the good part (Imports + States)
const header = lines.slice(0, 149).join('\n');

// 2. Rebuild the missing logic and UI
const rebuiltRest = `
    useEffect(() => {
        const interval = setInterval(() => {
           const fluctuations = {};
           if (selMkt) {
              selMkt.crops.forEach(cid => {
                 fluctuations[cid] = (Math.random() * 20 - 10).toFixed(0);
              });
           }
           setLivePriceFluctuations(fluctuations);
        }, 5000);
        return () => clearInterval(interval);
     }, [selMkt]);

    // Notification Trigger
    useEffect(() => {
       if (gatePass && gatePass.status === 'Approved' && !isStaffLoggedIn) {
          setLastAction(L === 'mr' ? "🎉 तुमचा गेट पास मंजूर झाला आहे! आता तुम्ही पेमेंट करू शकता." : "🎉 Your Gate Pass is Approved! You can pay now.");
          if (window.navigator.vibrate) window.navigator.vibrate(200);
       }
    }, [gatePass?.status]);

    const livePass = useMemo(() => {
       if (!gatePass) return null;
       const targetVeh = (gatePass.vehicleNo || '').toUpperCase();
       const targetId = gatePass._id;
       const inReq = pendingRequests.find(r => r._id === targetId || (r.vehicleNo && r.vehicleNo.toUpperCase() === targetVeh));
       if (inReq) return { ...gatePass, ...inReq };
       const inLogs = authorityLog.find(l => l._id === targetId || (l.vehicleNo && l.vehicleNo.toUpperCase() === targetVeh));
       if (inLogs) return { ...gatePass, ...inLogs };
       return gatePass;
    }, [gatePass, pendingRequests, authorityLog]);

    const [farmerLogTab, setFarmerLogTab] = useState('pass');
    const [processingReq, setProcessingReq] = useState(null);
    const [genAmount, setGenAmount] = useState('50');

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
       return authorityLog.filter(l => l.userId === userId || (!l.userId && gatePass && (l.vehicleNo === gatePass.vehicleNo)));
    }, [authorityLog, isStaffLoggedIn, userId, gatePass]);

    const updateMktRequests = (newReqs) => {
       const unique = Array.from(new Map(newReqs.map(item => [item._id || item.id, item])).values());
       setPendingRequests(unique);
    };

    const updateMktOverrides = (newObj) => {
       setMktOverrides(newObj);
    };

    const triggerUPI = (app) => {
       const vpa = "9890553011@ybl";
       const name = "APMC Office";
       const amt = livePass?.fee?.replace(/[^0-9]/g,'') || 50;
       let url = \`upi://pay?pa=\${vpa}&pn=\${encodeURIComponent(name)}&am=\${amt}&cu=INR&tn=MandiPass\`;
       if (app === 'phonepe') url = \`phonepe://pay?pa=\${vpa}&pn=\${encodeURIComponent(name)}&am=\${amt}&cu=INR\`;
       if (app === 'gpay') url = \`tez://upi/pay?pa=\${vpa}&pn=\${encodeURIComponent(name)}&am=\${amt}&cu=INR\`;
       if (app === 'paytm') url = \`paytmmp://pay?pa=\${vpa}&pn=\${encodeURIComponent(name)}&am=\${amt}&cu=INR\`;
       window.location.href = url;
       setIsPaying(true);
       setTimeout(() => {
          const inTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          api.updateLogisticsStatus(livePass._id || livePass.id, 'Approved').then(() => {
             api.addMandiLog({
                mandiId: selMkt.id,
                vehicleNo: livePass.vehicleNo || livePass.id,
                driver: livePass.driverName || livePass.driver,
                type: '🚛 Truck',
                crop: livePass.cropName || livePass.crop,
                weight: livePass.quantity || livePass.wt,
                status: 'inside',
                payStatus: 'paid',
                fee: livePass.fee || '₹50',
                userId: livePass.userId || userId,
                inTime: inTime
             }).then(resLog => {
                const updatedPass = { ...livePass, ...resLog, status: 'inside', pay: 'paid', inTime };
                updateMktLog([updatedPass, ...authorityLog]);
                setGatePass(updatedPass);
                setLastAction(L === 'mr' ? "पेमेंट यशस्वी! गाडी मार्केटमध्ये प्रवेश करू शकते. ✅" : "Payment Successful! Vehicle can enter. ✅");
                setTimeout(() => setLastAction(null), 4000);
             });
          });
       }, 5000);
    };

    return (
       <div className="market-hub-container">
          {/* Header & Navigation */}
          <nav className="mh-nav glass-card">
             <div className="mh-nav-left">
                <button className="mh-back-btn" onClick={() => {
                   if (selMkt) setSelMkt(null);
                   else onNavigate('home');
                }}>←</button>
                <h1>{L === 'mr' ? 'बाजार समिती' : 'APMC Portal'}</h1>
             </div>
             <div className="mh-nav-right">
                <button className="mh-lang-btn" onClick={() => setL(L === 'mr' ? 'en' : 'mr')}>
                   {L === 'mr' ? 'English' : 'मराठी'}
                </button>
             </div>
          </nav>

          <main className="mh-main">
             {!selMkt ? (
                <div className="mh-market-explorer">
                   <div className="mh-search-box glass-card">
                      <input 
                         type="text" 
                         placeholder={L === 'mr' ? 'मार्केट किंवा जिल्हा शोधा...' : 'Search market or district...'}
                         value={search}
                         onChange={e => setSearch(e.target.value)}
                      />
                   </div>
                   <div className="mh-market-grid">
                      {ALL_DISTRICTS.map(m => (
                         <div key={m.id} className="mh-market-card glass-card" onClick={() => setSelMkt(m)}>
                            <div className="mmc-icon">🏢</div>
                            <div className="mmc-info">
                               <h3>{m.name[L]}</h3>
                               <p>{m.dist[L]} • {m.crops.length} {L === 'mr' ? 'पिके' : 'Crops'}</p>
                            </div>
                            <div className="mmc-arrow">→</div>
                         </div>
                      ))}
                   </div>
                </div>
             ) : (
                <div className="mh-market-dashboard">
                   <div className="mh-mkt-header glass-card">
                      <div className="mmh-top">
                         <h2>{selMkt.name[L]} APMC</h2>
                         <div className="mmh-badges">
                            <span className="mmh-badge live">LIVE</span>
                            <span className="mmh-badge dist">{selMkt.dist[L]}</span>
                         </div>
                      </div>
                      <div className="mh-tabs">
                         <button className={activeTab === 'rates' ? 'active' : ''} onClick={() => setActiveTab('rates')}>{L === 'mr' ? 'बाजार भाव' : 'Live Rates'}</button>
                         <button className={activeTab === 'logistics' ? 'active' : ''} onClick={() => setActiveTab('logistics')}>{L === 'mr' ? 'वाहतूक / गेट पास' : 'Gate Pass'}</button>
                         <button className={activeTab === 'alerts' ? 'active' : ''} onClick={() => setActiveTab('alerts')}>{L === 'mr' ? 'महत्वाच्या सूचना' : 'Mandi Alerts'}</button>
                      </div>
                   </div>

                   <div className="mh-tab-content">
                      {activeTab === 'rates' && (
                         <div className="mh-rates-view animate-in">
                            <div className="mh-rates-grid">
                               {selMkt.crops.map(cid => {
                                  const c = CROPS[cid];
                                  const pData = mktOverrides.prices[cid];
                                  const basePrice = pData?.modal || c?.base || 2000;
                                  const fluctuation = parseInt(livePriceFluctuations[cid] || 0);
                                  const modalPrice = basePrice + fluctuation;
                                  const isFallback = pData?.isFallback;
                                  const lastUpdate = pData?.lastUpdate || 'Live';
                                  const trend = pData?.status || 'stable';

                                  return (
                                     <div key={cid} className={\`mh-crop-p-card \${isFallback ? 'fallback' : ''}\`} onClick={() => setSelCropId(cid)}>
                                        <div className="mcp-header">
                                           <div className={\`mcp-badge live \${trend}\`}><span className="mcp-live-dot pulsate" />{trend === 'bullish' ? '▲ ' : ''}{L === 'mr' ? 'थेट' : 'LIVE'}</div>
                                           <div className="mcp-update-ts">{lastUpdate}</div>
                                           {isFallback && <div className="mcp-fallback-tag">{L === 'mr' ? 'जवळपासचा कल' : 'Nearby Trend'}</div>}
                                        </div>
                                        <div className="mcp-img"><span className="mcp-crop-emoji">{c?.icon || '🌾'}</span></div>
                                        <div className="mcp-crop-title"><h4>{c?.[L] || cid}</h4></div>
                                        <div className="mcp-price-main"><span>₹{modalPrice.toLocaleString()}</span><small>/Q</small></div>
                                     </div>
                                  );
                               })}
                            </div>
                         </div>
                      )}

                      {activeTab === 'logistics' && (
                         <div className="mh-logistics-view animate-in">
                            {isStaffLoggedIn ? (
                               <div className="mh-admin-logistics glass-card">
                                  <div className="al-tabs">
                                     <button className={adminLogView === 'pending' ? 'active' : ''} onClick={() => setAdminLogView('pending')}>{L === 'mr' ? 'नवीन विनंत्या' : 'New Requests'}</button>
                                     <button className={adminLogView === 'active' ? 'active' : ''} onClick={() => setAdminLogView('active')}>{L === 'mr' ? 'सक्रिय वाहन लॉग' : 'Active Logs'}</button>
                                  </div>
                                  <div className="al-content">
                                     {adminLogView === 'pending' ? (
                                        <div className="al-queue">
                                           {filteredRequests.length === 0 ? <p>{L === 'mr' ? 'प्रलंबित विनंत्या नाहीत.' : 'No pending requests.'}</p> : (
                                              <div className="req-list">
                                                 {filteredRequests.map(r => (
                                                    <div key={r._id} className="req-card">
                                                       <div className="rc-info">
                                                          <b>{r.vehicleNo}</b>
                                                          <span>{r.driverName} • {r.cropName}</span>
                                                       </div>
                                                       <div className="rc-actions">
                                                          <button onClick={() => setProcessingReq(r)}>Process</button>
                                                       </div>
                                                    </div>
                                                 ))}
                                              </div>
                                           )}
                                        </div>
                                     ) : (
                                        <div className="al-active-logs">
                                           <table className="al-table">
                                              <thead>
                                                 <tr><th>Vehicle</th><th>In-Time</th><th>Status</th><th>Action</th></tr>
                                              </thead>
                                              <tbody>
                                                 {filteredLog.map(l => (
                                                    <tr key={l._id}>
                                                       <td>{l.vehicleNo}</td>
                                                       <td>{l.inTime}</td>
                                                       <td>{l.status}</td>
                                                       <td>
                                                          {l.status === 'inside' && <button onClick={() => api.updateMandiLogStatus(l._id, 'out', new Date().toLocaleTimeString()).then(() => setSelMkt({...selMkt}))}>Exit</button>}
                                                       </td>
                                                    </tr>
                                                 ))}
                                              </tbody>
                                           </table>
                                        </div>
                                     )}
                                  </div>
                               </div>
                            ) : (
                               <div className="mh-farmer-logistics">
                                  {!livePass ? (
                                     <div className="mh-no-pass glass-card">
                                        <p>{L === 'mr' ? 'तुमचा गेट पास नाही.' : 'You have no active gate pass.'}</p>
                                        <button className="mh-btn-primary" onClick={() => setMainView('reg-pass')}>{L === 'mr' ? 'नवीन पास तयार करा' : 'Register New Pass'}</button>
                                     </div>
                                  ) : (
                                     <div className="mh-active-pass glass-card">
                                        <div className="ap-header">
                                           <h3>GATE PASS: {livePass.vehicleNo}</h3>
                                           <span className={\`status-badge \${livePass.status}\`}>{livePass.status.toUpperCase()}</span>
                                        </div>
                                        <div className="ap-body">
                                           <p>Driver: {livePass.driverName}</p>
                                           <p>Crop: {livePass.cropName}</p>
                                           {livePass.status === 'ready_for_payment' && (
                                              <button className="mh-btn-pay" onClick={() => setShowPhonePe(true)}>{L === 'mr' ? 'पेमेंट करा' : 'Pay Now'}</button>
                                           )}
                                        </div>
                                     </div>
                                  )}
                               </div>
                            )}
                         </div>
                      )}
                   </div>
                </div>
             )}
          </main>

          {showPhonePe && (
             <div className="phonepe-overlay">
                <div className="phonepe-modal glass-card">
                   <div className="pp-header">
                      <h2>PhonePe</h2>
                      <button onClick={() => setShowPhonePe(false)}>✕</button>
                   </div>
                   {isPaying ? (
                      <div className="pp-success">✅ Payment Successful!</div>
                   ) : (
                      <div className="pp-body">
                         <div className="pp-upi-options" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', padding:'20px'}}>
                            <div className="pp-option-v2" onClick={() => triggerUPI('phonepe')} style={{cursor:'pointer', textAlign:'center', padding:'10px', background:'#f8f9fa', borderRadius:'12px'}}>
                               <img src="https://img.icons8.com/color/48/000000/phonepe.png" alt="PhonePe" style={{width:'32px'}} />
                               <div style={{fontSize:'10px', marginTop:'5px'}}>PhonePe</div>
                            </div>
                            <div className="pp-option-v2" onClick={() => triggerUPI('gpay')} style={{cursor:'pointer', textAlign:'center', padding:'10px', background:'#f8f9fa', borderRadius:'12px'}}>
                               <img src="https://img.icons8.com/color/48/000000/google-pay.png" alt="GPay" style={{width:'32px'}} />
                               <div style={{fontSize:'10px', marginTop:'5px'}}>GPay</div>
                            </div>
                            <div className="pp-option-v2" onClick={() => triggerUPI('paytm')} style={{cursor:'pointer', textAlign:'center', padding:'10px', background:'#f8f9fa', borderRadius:'12px'}}>
                               <img src="https://img.icons8.com/color/48/000000/paytm.png" alt="Paytm" style={{width:'32px'}} />
                               <div style={{fontSize:'10px', marginTop:'5px'}}>Paytm</div>
                            </div>
                         </div>
                         <button className="pp-pay-btn" onClick={() => triggerUPI('generic')}>Pay with UPI</button>
                      </div>
                   )}
                </div>
             </div>
          )}

          {lastAction && (
             <div className="auth-success-toast">
                <span>✅ {lastAction}</span>
             </div>
          )}
       </div>
    );
}
\`;

fs.writeFileSync(path, header + rebuiltRest);
console.log('MarketPage.js Reconstructed Successfully.');
