const fs = require('fs');
const path = 'src/components/MarketPage.js';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find the target lines more robustly
const startIdx = lines.findIndex(l => l.includes('// Use dynamic overrides or fallback to static base data'));

if (startIdx !== -1) {
    const replacement = [
        `                                     // Use dynamic overrides or fallback to static base data`,
        `                                     const pData = mktOverrides.prices[cid];`,
        `                                     const basePrice = pData?.modal || c.base;`,
        `                                     const fluctuation = parseInt(livePriceFluctuations[cid] || 0);`,
        `                                     const modalPrice = basePrice + fluctuation;`,
        `                                     const maxPrice = pData?.max || (Math.floor(modalPrice * 1.08) + Math.abs(fluctuation));`,
        `                                     const arrival = pData?.arrival || (Math.floor((modalPrice % 100) * 2) + 40);`,
        `                                     const isFallback = pData?.isFallback;`,
        `                                     const lastUpdate = pData?.lastUpdate || 'Live';`,
        `                                     const trend = pData?.status || 'stable';`,
        ``,
        `                                     return (`,
        `                                        <div key={cid} className={\`mh-crop-p-card \${isFallback ? 'fallback' : ''}\`} onClick={() => setSelCropId(cid)}>\`,
        `                                           <div className="mcp-header">`,
        `                                              <div className={\`mcp-badge live \${trend}\`}><span className="mcp-live-dot pulsate" />{trend === 'bullish' ? '▲ ' : ''}{L === 'mr' ? 'थेट' : 'LIVE'}</div>`,
        `                                              <div className="mcp-update-ts">{lastUpdate}</div>`,
        `                                              {isFallback && <div className="mcp-fallback-tag">{L === 'mr' ? 'जवळपासचा कल' : 'Nearby Trend'}</div>}`
    ];
    
    // We want to replace from startIdx to the <div className="mcp-header"> line
    const headerIdx = lines.findIndex((l, i) => i > startIdx && l.includes('<div className="mcp-header">'));
    
    if (headerIdx !== -1) {
        lines.splice(startIdx, (headerIdx - startIdx) + 1, ...replacement);
        fs.writeFileSync(path, lines.join('\n'));
        console.log('Successfully updated MarketPage.js UI logic.');
    } else {
        console.log('Could not find header line');
    }
} else {
    console.log('Could not find start index');
}
