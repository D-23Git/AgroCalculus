const fs = require('fs');
const path = 'src/components/MarketPage.js';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Keep everything before the corrupted Admin block
const startCorrupt = lines.findIndex(l => l.includes("adminLogView === 'pending' ? ("));
if (startCorrupt === -1) {
    console.log('Could not find start of corruption');
    process.exit(1);
}

const head = lines.slice(0, startCorrupt).join('\n');

const missingBlock = ` {adminLogView === 'pending' ? (
                                        <div className="al-queue animate-in">
                                           {processingReq ? (
                                              <div className="al-processing-card glass-card">
                                                 <div className="apc-header">
                                                    <button className="apc-back" onClick={() => setProcessingReq(null)}>←</button>
                                                    <h4>{L === 'mr' ? 'विनंती प्रक्रिया' : 'Process Request'}</h4>
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
                                                                 const updatedReq = await api.updateLogisticsStatus(processingReq._id, 'ready_for_payment', \`₹\${genAmount}\`);
                                                                 updateMktRequests(pendingRequests.map(r => r._id === processingReq._id ? updatedReq : r));
                                                                 setProcessingReq(null);
                                                                 setLastAction(L === 'mr' ? "QR पेमेंट विनंती पाठवली!" : "QR Payment Request Sent!");
                                                                 setTimeout(() => setLastAction(null), 3000);
                                                             } catch(err) { console.error(err); }
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
                                                                   fee: \`₹\${genAmount}.00\`,
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
                                                 {filteredRequests.length === 0 ? (
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
                                                          {filteredRequests.map((r) => (
                                                             <tr key={r._id || r.id}>
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
                                        <div className="al-active-logs animate-in">
                                           <table className="ef-table active">
                                              <thead>
                                                 <tr>
                                                    <th>{L === 'mr' ? 'वाहन' : 'Vehicle'}</th>
                                                    <th>{L === 'mr' ? 'स्थिती' : 'Status'}</th>
                                                    <th>{L === 'mr' ? 'पेमेंट' : 'Payment'}</th>
                                                    <th>{L === 'mr' ? 'क्रिया' : 'Action'}</th>
                                                 </tr>
                                              </thead>
                                              <tbody>
                                                 {filteredLog.map((v) => (
                                                    <tr key={v._id || v.id}>
                                                       <td>
                                                          <div className="v-info">
                                                             <b>{v.vehicleNo || v.id}</b>
                                                             <span>{v.crop} • {v.wt}</span>
                                                          </div>
                                                       </td>
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
                                                                } catch(err) { console.error('Admin exit error:', err); }
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
                               </div>
                            )}
                         </div>
                      )}
                   </div>
                </div>
             )}
          </main>

          {showPhonePe && (
             <div className="phonepe-overlay animate-in">
                <div className="phonepe-modal glass-card">
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
                         <div style={{textAlign:'center', marginBottom:'15px'}}>
                            <img src={\`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=\${encodeURIComponent(\`upi://pay?pa=9890553011@ybl&pn=APMC%20Office&am=\${pendingV?.fee?.replace(/[^0-9]/g,'') || 50}&cu=INR\`)}\`} alt="QR" style={{width:'80px', opacity:0.6}} />
                            <p style={{fontSize:'10px', color:'#666', marginTop:'5px'}}>{L === 'mr' ? 'किंवा QR स्कॅन करा' : 'Or scan QR code'}</p>
                         </div>
                         <button className="pp-pay-btn" onClick={() => triggerUPI('generic')}>
                            {L === 'mr' ? 'पेमेंट सुरू करा' : 'Proceed to Pay'}
                         </button>
                      </div>
                   )}
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
                data={mktOverrides.prices[selCropId]}
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
                   </div>

                   <div className="receipt-actions">
                      <button className="btn-receipt-share" onClick={() => {
                         const text = \`Digital Pass: \${completedVisit.id}\\nMarket: \${selMkt.name[L]}\\nExit: \${completedVisit.outTime}\\nStatus: Completed\`;
                         window.open(\`https://wa.me/?text=\${encodeURIComponent(text)}\`);
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
       </div>
    );
}
\`;

fs.writeFileSync(path, head + missingBlock);
console.log('MarketPage.js Reconstructed Completely.');
