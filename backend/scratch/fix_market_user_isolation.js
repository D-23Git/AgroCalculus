const fs = require('fs');
const path = 'src/components/MarketPage.js';
let content = fs.readFileSync(path, 'utf8');

// Fix history map
content = content.replace(/\{authorityLog\.length === 0 \? \(/g, '{filteredLog.length === 0 ? (');
content = content.replace(/authorityLog\.map\(\(item, idx\) => \(/g, 'filteredLog.map((item, idx) => (');

// Fix setGatePass
content = content.replace(/setGatePass\(res\);/g, 'setGatePass({ ...res, userId });');

fs.writeFileSync(path, content);
console.log('Fixed MarketPage.js programmatically');
