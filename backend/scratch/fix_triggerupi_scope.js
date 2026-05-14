const fs = require('fs');
const path = 'src/components/MarketPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Correct the useEffect and triggerUPI scope
const effectRegex = /useEffect\(\(\) => \{\s+const interval = setInterval\(\(\) => \{[\s\S]+?const triggerUPI = [\s\S]+?return \(\) => clearInterval\(interval\);\s+\}, \[selMkt\]\);/;
const correctedEffect = `useEffect(() => {
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

    const triggerUPI = (app) => {
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
     };`;

if (effectRegex.test(content)) {
    content = content.replace(effectRegex, correctedEffect);
    fs.writeFileSync(path, content);
    console.log('Fixed triggerUPI scope.');
} else {
    console.log('Could not find corrupted effect block.');
}
