const fs = require('fs');
const path = 'src/components/MarketPage.js';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Duplicated block starts at line 920 (index 919) and ends at line 938 (index 937)
// Wait, I should be very careful.
// Let's look for the exact lines.
const startLine = 920;
const endLine = 938;

lines.splice(startLine - 1, endLine - startLine + 1);

fs.writeFileSync(path, lines.join('\n'));
console.log('Fixed MarketPage.js by deleting lines', startLine, 'to', endLine);
