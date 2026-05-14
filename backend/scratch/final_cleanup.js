const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Desktop', 'agro-app', 'src', 'components', 'MarketPage.js');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const resultLines = [];

let inOrphanBlock = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // We know line 156-193 is the GOOD one.
    if (lineNum >= 156 && lineNum <= 193) {
        resultLines.push(line);
        continue;
    }

    // Check for orphans
    if (!inOrphanBlock && (line.includes('updateMktLog([updatedPass') || line.includes('const triggerUPI = (app) => {'))) {
        inOrphanBlock = true;
        // We need to skip lines until we hit the "};" that closes it.
        // But some orphans are just fragments.
        console.log(`Found orphan starting at line ${lineNum}`);
        continue;
    }

    if (inOrphanBlock) {
        // If we hit a return statement or another major block, stop.
        if (line.includes('return (') || line.includes('const ') || line.includes('useEffect(')) {
            inOrphanBlock = false;
            resultLines.push(line);
        }
        // Also if we hit "};" and it's the last one
        if (line.includes('};')) {
            inOrphanBlock = false;
        }
        continue;
    }

    resultLines.push(line);
}

fs.writeFileSync(filePath, resultLines.join('\n'));
console.log('Final surgical cleanup complete!');
