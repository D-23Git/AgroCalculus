const fs = require('fs');
const path = 'src/components/MarketPage.js';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `<div className="pp-upi-options">
                                          <div className="pp-option active">
                                             <img src="https://img.icons8.com/color/48/000000/upi.png" alt="UPI" />
                                             <span>UPI ID / App</span>
                                          </div>
                                       </div>
                                       <button className="pp-pay-btn" onClick={() => {
                                          setIsPaying(true);
                                          setTimeout(() => {
                                             const inTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });`;

const replacementStr = `<div className="pp-upi-options">
                                          <div className="pp-option active" style={{flexDirection:'column', gap:'10px', height:'auto', padding:'20px'}}>
                                             <img src={\`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=\${encodeURIComponent(\`upi://pay?pa=mandi_official@upi&pn=APMC%20Office&am=\${pendingV?.fee?.replace(/[^0-9]/g,'') || 50}&cu=INR\`)}\`} alt="UPI QR" style={{width:'150px', height:'150px'}} />
                                             <span style={{fontSize:'12px', opacity:0.7}}>{L === 'mr' ? 'स्कॅन करा किंवा खालील बटण दाबा' : 'Scan QR or use button below'}</span>
                                          </div>
                                       </div>
                                       <button className="pp-pay-btn" onClick={() => {
                                          // Real UPI Deep Link
                                          const upiUrl = \`upi://pay?pa=mandi_official@upi&pn=APMC%20Office&am=\${pendingV?.fee?.replace(/[^0-9]/g,'') || 50}&cu=INR&tn=GatePass%20Fee\`;
                                          window.location.href = upiUrl;
                                          
                                          // Simulate success after a delay for testing
                                          setIsPaying(true);
                                          setTimeout(() => {
                                             const inTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(path, content);
    console.log('Successfully updated UPI payment block.');
} else {
    // Try a more flexible match if direct string fail
    console.log('Failed to locate target UPI block exactly.');
}
