const fs = require('fs');
const path = 'src/components/MarketPage.js';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `                                     // Use dynamic overrides or fallback to static base data
                                     const basePrice = mktOverrides.prices[cid]?.modal || c.base;
                                     const fluctuation = parseInt(livePriceFluctuations[cid] || 0);
                                     const modalPrice = basePrice + fluctuation;
                                     const maxPrice = Math.floor(modalPrice * 1.08) + Math.abs(fluctuation);
                                     const arrival = mktOverrides.prices[cid]?.arrival || (Math.floor((modalPrice % 100) * 2) + 40);

                                     return (
                                        <div key={cid} className="mh-crop-p-card" onClick={() => setSelCropId(cid)}>
                                           <div className="mcp-header">
                                              <div className="mcp-badge live"><span className="mcp-live-dot pulsate" />LIVE</div>`;

const replacementStr = `                                     // Use dynamic overrides or fallback to static base data
                                     const pData = mktOverrides.prices[cid];
                                     const basePrice = pData?.modal || c.base;
                                     const fluctuation = parseInt(livePriceFluctuations[cid] || 0);
                                     const modalPrice = basePrice + fluctuation;
                                     const maxPrice = pData?.max || (Math.floor(modalPrice * 1.08) + Math.abs(fluctuation));
                                     const arrival = pData?.arrival || (Math.floor((modalPrice % 100) * 2) + 40);
                                     const isFallback = pData?.isFallback;
                                     const lastUpdate = pData?.lastUpdate || 'Live';
                                     const trend = pData?.status || 'stable';

                                     return (
                                        <div key={cid} className={\`mh-crop-p-card \${isFallback ? 'fallback' : ''}\`} onClick={() => setSelCropId(cid)}>
                                           <div className="mcp-header">
                                              <div className={\`mcp-badge live \${trend}\`}><span className="mcp-live-dot pulsate" />{trend === 'bullish' ? '▲ ' : ''}{L === 'mr' ? 'थेट' : 'LIVE'}</div>
                                              <div className="mcp-update-ts">{lastUpdate}</div>
                                              {isFallback && <div className="mcp-fallback-tag">{L === 'mr' ? 'जवळपासचा कल' : 'Nearby Trend'}</div>}`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(path, content);
    console.log('Successfully updated MarketPage.js UI logic.');
} else {
    console.log('Failed to locate the target UI block.');
}
