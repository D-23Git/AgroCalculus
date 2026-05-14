const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Desktop', 'agro-app', 'src', 'components', 'MarketPage.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove all internal triggerUPI declarations
// We search for the pattern and remove it
const triggerUPIPattern = /const triggerUPI = \(app\) => \{[\s\S]*?\};\s*/g;
content = content.replace(triggerUPIPattern, '');

// 2. Insert ONE triggerUPI at the top level of the component (after state declarations)
const topLevelTriggerUPI = `
   const triggerUPI = (app) => {
      const vpa = "9373082323-2@ybl"; // Production VPA
      const name = "APMC Office";
      const amt = pendingV?.fee?.replace(/[^0-9]/g, '') || 50;
      let url = \`upi://pay?pa=\${vpa}&pn=\${encodeURIComponent(name)}&am=\${amt}&cu=INR&tn=MandiPass\`;

      if (app === 'phonepe') url = \`phonepe://pay?pa=\${vpa}&pn=\${encodeURIComponent(name)}&am=\${amt}&cu=INR\`;
      if (app === 'gpay') url = \`tez://upi/pay?pa=\${vpa}&pn=\${encodeURIComponent(name)}&am=\${amt}&cu=INR\`;
      if (app === 'paytm') url = \`paytmmp://pay?pa=\${vpa}&pn=\${encodeURIComponent(name)}&am=\${amt}&cu=INR\`;

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
`;

// Insert after the state declarations
content = content.replace(/const \[livePriceFluctuations, setLivePriceFluctuations\] = useState\(\{\}\);/, 
    `const [livePriceFluctuations, setLivePriceFluctuations] = useState({});\n${topLevelTriggerUPI}`);

// 3. Fix persistence and staff login logic
content = content.replace(/const \[userRole, setUserRole\] = useState\('farmer'\);/, 
    `const [userRole, setUserRole] = useState(localStorage.getItem(\`agro-mkt-role-\${userId}\`) || 'farmer');`);

content = content.replace(/const \[isStaffLoggedIn, setIsStaffLoggedIn\] = useState\(localStorage\.getItem\(\`agro-mkt-staff-\${userId}\`\) === 'true'\);|const \[isStaffLoggedIn, setIsStaffLoggedIn\] = useState\(false\);/, 
    `const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(localStorage.getItem(\`agro-mkt-staff-\${userId}\`) === 'true');`);

// Add handleStaffLogin helper
if (!content.includes('const handleStaffLogin')) {
    content = content.replace(/const updateMktOverrides = \(newObj\) => \{/, 
        `const handleStaffLogin = (status) => {
      setIsStaffLoggedIn(status);
      setUserRole(status ? 'authority' : 'farmer');
      localStorage.setItem(\`agro-mkt-staff-\${userId}\`, status);
      localStorage.setItem(\`agro-mkt-role-\${userId}\`, status ? 'authority' : 'farmer');
   };

   const updateMktOverrides = (newObj) => {`);
}

// 4. Update login modal to use handleStaffLogin
content = content.replace(/setIsStaffLoggedIn\(true\);\s*setUserRole\('authority'\);/g, 'handleStaffLogin(true);');

// 5. Add Logout Button in Navbar
if (!content.includes('mh-logout-btn')) {
    content = content.replace(/<button className="lang-toggle"/, 
        `{isStaffLoggedIn && (
                   <button className="mh-logout-btn" onClick={() => handleStaffLogin(false)} style={{marginRight:'10px', background:'#ff4757', color:'white', border:'none', padding:'5px 10px', borderRadius:'8px', cursor:'pointer'}}>
                      {L === 'mr' ? 'बाहेर पडा' : 'Logout'}
                   </button>
                )}\n                  <button className="lang-toggle"`);
}

// 6. Fix any accidental structural damage to component header
if (!content.includes('export default function MarketPage')) {
    content = 'import React, { useState, useEffect, useMemo } from \'react\';\n' +
              'import \'./MarketPage.css\';\n' +
              'import { DISTRICTS, CROPS, ALL_DISTRICTS } from \'./MarketData\';\n' +
              'import AgroService from \'../services/AgroService\';\n' +
              'import api from \'../utils/apiService\';\n' +
              'import { FavoritesHubView, CompareHubView } from \'./HubViews\';\n' +
              'import GrievanceSystem from \'./GrievanceSystem\';\n' +
              'import CropDetailModal from \'./CropDetailModal\';\n\n' +
              'export default function MarketPage({ lang: propL = \'mr\', onNavigate, profile }) {\n' +
              content.substring(content.indexOf('const userId'));
}

fs.writeFileSync(filePath, content);
console.log('Surgical cleanup complete!');
