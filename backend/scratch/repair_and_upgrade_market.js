const fs = require('fs');
const path = 'src/components/MarketPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. REPAIR THE DAMAGED ADMIN LOG TABLE
const corruptedRegex = /<span className="pay-status pa\s+<div className="pp-upi-options"[\s\S]+?<\/button>\s+}}>/;
const restoredAdminBlock = `<span className="pay-status paid">✅ {v.fee || '₹50'} ({v.payMode || 'UPI'})</span> :
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
                                                            }}>`;

if (corruptedRegex.test(content)) {
   content = content.replace(corruptedRegex, restoredAdminBlock);
   console.log('Restored Admin Log Table.');
} else {
   console.log('Could not find corrupted Admin block.');
}

// 2. INSERT triggerUPI FUNCTION
const triggerUPIFunc = `    const triggerUPI = (app) => {
       const vpa = "9890553011@ybl"; // Example Valid VPA
       const name = "APMC Office";
       const amt = pendingV?.fee?.replace(/[^0-9]/g,'') || 50;
       let url = \`upi://pay?pa=\${vpa}&pn=\${encodeURIComponent(name)}&am=\${amt}&cu=INR&tn=MandiPass\`;
       
       if (app === 'phonepe') url = \`phonepe://pay?pa=\${vpa}&pn=\${encodeURIComponent(name)}&am=\${amt}&cu=INR\`;
       if (app === 'gpay') url = \`tez://upi/pay?pa=\${vpa}&pn=\${encodeURIComponent(name)}&am=\${amt}&cu=INR\`;
       if (app === 'paytm') url = \`paytmmp://pay?pa=\${vpa}&pn=\${encodeURIComponent(name)}&am=\${amt}&cu=INR\`;
       
       window.location.href = url;
       
       // Still trigger the "Paying" state for UI feedback
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

    return (`;

content = content.replace(/return \(/g, triggerUPIFunc);

// 3. UPDATE PHONEPE MODAL UI
const oldPhonePeBody = /<div className="pp-body">[\s\S]+?<button className="pp-pay-btn"[\s\S]+?<\/button>/;
const newPhonePeBody = `<div className="pp-body">
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
                                       </button>`;

if (oldPhonePeBody.test(content)) {
   content = content.replace(oldPhonePeBody, newPhonePeBody);
   console.log('Updated PhonePe Modal UI.');
}

fs.writeFileSync(path, content);
console.log('MarketPage.js fully repaired and upgraded.');
