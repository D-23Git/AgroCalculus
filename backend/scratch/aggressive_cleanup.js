const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Desktop', 'agro-app', 'src', 'components', 'MarketPage.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Aggressively remove all triggerUPI declarations except the first one
// We'll find all instances of "const triggerUPI = (app) => {" and remove the duplicates.
// The first one is at the top level, others are inside return/map/IIFE.

const triggerUPIHeader = 'const triggerUPI = (app) => {';
let parts = content.split(triggerUPIHeader);

if (parts.length > 1) {
    // Keep the first one and the text before it
    let newContent = parts[0] + triggerUPIHeader + parts[1];
    
    // For the remaining parts, we need to remove the function body
    for (let i = 2; i < parts.length; i++) {
        let part = parts[i];
        // Find the matching closing brace for the function
        // This is tricky for a large file, but we can assume it ends with "};" or similar
        // Since we know the structure from previous view_file, it usually ends at the next major block
        // Alternatively, we can just remove the declaration line if it's inside a scope
        // but that leaves a broken body.
        
        // Let's use a more robust regex to find and remove internal ones
        // We look for ones that are NOT preceded by a newline and some specific indentation at top level.
    }
    
    // Better approach: Regex for internal ones
    // Internal ones are usually inside a block, so they might have more indentation or be inside a variable.
}

// REFINED PLAN: Use a regex to find all triggerUPI declarations and remove all but the first one found in the component body.
// The component body starts after the state declarations.

// Let's just use a simpler method: Replace all instances with a placeholder, then put the first one back.
const placeholder = '___TRIGGER_UPI_PLACEHOLDER___';
content = content.replace(/const triggerUPI = \(app\) => \{[\s\S]*?\};/g, (match, offset) => {
    // If it's the first one, we might want to keep it, but we'll insert a fresh one anyway.
    return placeholder;
});

// Remove all placeholders
content = content.replace(new RegExp(placeholder, 'g'), '');

// Now insert ONE fresh triggerUPI at line 156 (after livePriceFluctuations)
const freshTriggerUPI = `
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
   };`;

content = content.replace(/const \[livePriceFluctuations, setLivePriceFluctuations\] = useState\(\{\}\);/, 
    `const [livePriceFluctuations, setLivePriceFluctuations] = useState({});\n${freshTriggerUPI}`);

// 2. Fix api.addMandiPrice to api.updateMandiPrice
content = content.replace(/api\.addMandiPrice/g, 'api.updateMandiPrice');

// 3. Fix potential bracket issues at the end of the file
// Ensure the component ends correctly
if (!content.trim().endsWith('}')) {
    // This is dangerous, let's just log it
    console.log('Warning: File does not end with a brace');
}

fs.writeFileSync(filePath, content);
console.log('Aggressive deduplication and API fix complete!');
