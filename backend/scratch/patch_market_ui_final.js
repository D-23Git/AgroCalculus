const fs = require('fs');
const path = 'src/components/MarketPage.js';
let content = fs.readFileSync(path, 'utf8');

// Use very broad regex to find the block
const regex = /\/\/ Use dynamic overrides or fallback to static base data\s+const basePrice = mktOverrides\.prices\[cid\]\?\.modal \|\| c\.base;\s+const fluctuation = parseInt\(livePriceFluctuations\[cid\] \|\| 0\);\s+const modalPrice = basePrice \+ fluctuation;\s+const maxPrice = Math\.floor\(modalPrice \* 1\.08\) \+ Math\.abs\(fluctuation\);\s+const arrival = mktOverrides\.prices\[cid\]\?\.arrival \|\| \(Math\.floor\(\(modalPrice % 100\) \* 2\) \+ 40\);/;

const replacement = `// Use dynamic overrides or fallback to static base data
                                     const pData = mktOverrides.prices[cid];
                                     const basePrice = pData?.modal || c.base;
                                     const fluctuation = parseInt(livePriceFluctuations[cid] || 0);
                                     const modalPrice = basePrice + fluctuation;
                                     const maxPrice = pData?.max || (Math.floor(modalPrice * 1.08) + Math.abs(fluctuation));
                                     const arrival = pData?.arrival || (Math.floor((modalPrice % 100) * 2) + 40);
                                     const isFallback = pData?.isFallback;
                                     const lastUpdate = pData?.lastUpdate || 'Live';
                                     const trend = pData?.status || 'stable';`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    
    // Now fix the LIVE badge
    content = content.replace(/<div className="mcp-badge live"><span className="mcp-live-dot pulsate" \/>LIVE<\/div>/g, 
        `<div className={\`mcp-badge live \${trend}\`}><span className="mcp-live-dot pulsate" />{trend === 'bullish' ? '▲ ' : ''}{L === 'mr' ? 'थेट' : 'LIVE'}</div>
                                              <div className="mcp-update-ts">{lastUpdate}</div>
                                              {isFallback && <div className="mcp-fallback-tag">{L === 'mr' ? 'जवळपासचा कल' : 'Nearby Trend'}</div>}`);
    
    fs.writeFileSync(path, content);
    console.log('Successfully patched MarketPage.js');
} else {
    console.log('Regex match failed');
}
