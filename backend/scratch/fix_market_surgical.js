const fs = require('fs');
const path = 'src/components/MarketPage.js';
let content = fs.readFileSync(path, 'utf8');

const badBlockRegex = /\{livePass\.status === 'inside' && \(\s+\{livePass\.status === 'out' && \([\s\S]+?\}\)\s+<div className="dgp-active-actions">[\s\S]+?<\/div>\s+\)\}\)/;

// Let's try a more robust search for the duplicated area
const startStr = "                                                     {livePass.status === 'inside' && (";
const endStr = "                                                     )}";

// I'll just find the range and replace it with a clean version
const startIndex = content.indexOf(startStr);
const lastIndex = content.lastIndexOf(endStr, content.indexOf("history-view") || content.length);

if (startIndex !== -1 && lastIndex !== -1) {
    const cleanBlock = `                                                     {livePass.status === 'inside' && (
                                                        <div className="dgp-active-actions">
                                                           <div className="dgp-active-badge">
                                                              <i className="check-icon">✅</i>
                                                              <span>{L === 'mr' ? 'पास सक्रिय - गेटवर स्कॅन करा' : 'Pass Active - Scan at Gate'}</span>
                                                           </div>
                                                           <button className="btn-farmer-exit" onClick={async () => {
                                                              const outTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                              try {
                                                                 const updatedLog = await api.updateMandiLogStatus(livePass._id || livePass.id, 'out', outTime);
                                                                 const finalVisit = { ...livePass, ...updatedLog, outTime, status: 'out' };
                                                                 updateMktLog(authorityLog.map(item => (item._id === livePass._id || item.id === livePass.id) ? finalVisit : item));
                                                                 setCompletedVisit(finalVisit);
                                                                 setGatePass(null);
                                                              } catch(err) { console.error(err); }
                                                           }}>
                                                              🚪 {L === 'mr' ? 'गेटमधून बाहेर पडा' : 'Exit Gate'}
                                                           </button>
                                                        </div>
                                                     )}
                                                     {livePass.status === 'out' && (
                                                        <div className="dgp-out-action" style={{marginTop: '15px'}}>
                                                           <button className="btn-pay-premium" onClick={() => setGatePass(null)}>
                                                              🔄 {L === 'mr' ? 'नवीन पास काढा' : 'Start New Entry'}
                                                           </button>
                                                        </div>
                                                     )}`;
    
    // We need to be careful what we are replacing.
    // I'll look for the whole block from the first 'inside' check to the end of the duplicated 'inside' check.
    const searchArea = content.substring(startIndex, lastIndex + endStr.length);
    const newContent = content.replace(searchArea, cleanBlock);
    fs.writeFileSync(path, newContent);
    console.log('Fixed MarketPage.js');
} else {
    console.log('Could not find the block to fix', {startIndex, lastIndex});
}
