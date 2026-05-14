const fs = require('fs');
const path = 'src/components/MarketPage.js';
let content = fs.readFileSync(path, 'utf8');

const targetAdminBlock = /\{adminLogView === 'pending' \? \([\s\S]+?\}\s+<\/div>\s+<\/div>/;
const restoredAdminLogistics = `{adminLogView === 'pending' ? (
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
                                     )}`;

if (targetAdminBlock.test(content)) {
    content = content.replace(targetAdminBlock, restoredAdminLogistics);
    fs.writeFileSync(path, content);
    console.log('Restored Full Admin Logistics UI.');
} else {
    console.log('Could not find target Admin block for restoration.');
}
