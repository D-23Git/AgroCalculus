import React, { useMemo } from 'react';
import './MarketPage.css';

// Extracted from MarketPage props: L, TX, favMkts, favIds, favCrops = [], filteredMandis = [], CROPS = {}, mktData, mktStats, setSelMkt, setMainView
export const FavoritesHubView = ({ L, favMkts, favIds, favCrops = [], filteredMandis = [], CROPS = {}, mktData, mktStats, setSelMkt, setMainView }) => {
   const ids = favMkts || favIds || [];
   const fMkts = filteredMandis.filter(m => ids.includes(m.id));
   const fCrops = Object.keys(CROPS).filter(cid => favCrops.includes(cid));

   return (
      <div className="hub-full-page animate-in">
         <div className="hub-header">
            <h2>❤️ {L === 'mr' ? 'माझी आवड (Favorites)' : 'My Favorites'}</h2>
            <p>{L === 'mr' ? 'तुम्ही सेव्ह केलेले मार्केट आणि पिके येथे दिसतील' : 'Markets and crops you bookmarked appear here'}</p>
         </div>

         <div className="hub-section">
            <h3>🏙️ {L === 'mr' ? 'आवडते मार्केट' : 'Favorite Markets'}</h3>
            {fMkts.length === 0 ? (
               <div className="hub-empty">{L === 'mr' ? 'कोणतेही मार्केट सेव्ह केलेले नाही.' : 'No markets saved yet.'}</div>
            ) : (
               <div className="mp24-grid">
                  {fMkts.map(m => (
                     <div key={m.id} className="m-card is-fav" onClick={() => { setSelMkt(m); setMainView('home'); }}>
                        <div className="m-h">
                           <span className="live"><span className="live-dot"></span>{L === 'mr' ? 'लाईव्ह' : 'Live'}</span>
                           <span className="m-vol">📊 {mktStats[m.id]?.total} {L === 'mr' ? 'वाहने' : 'Vehicles'}</span>
                        </div>
                        <div className="m-title-row">
                           <h3>{m.name[L]}</h3>
                        </div>
                        <p>📍 {m.location[L]}</p>
                        <div className="m-actions-top" style={{ marginTop: '15px' }}>
                           <button className="btn-home-nav" style={{ width: '100%', padding: '10px' }}>
                              {L === 'mr' ? 'मार्केटमध्ये जा' : 'Go to Market'} 🚀
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         <div className="hub-section">
            <h3>🌾 {L === 'mr' ? 'आवडती पिके' : 'Favorite Crops'}</h3>
            {fCrops.length === 0 ? (
               <div className="hub-empty">{L === 'mr' ? 'कोणतेही पीक सेव्ह केलेले नाही.' : 'No crops saved yet.'}</div>
            ) : (
               <div className="crop-grid-v24" style={{ padding: '0 50px', maxWidth: '1400px', margin: '0 auto' }}>
                  {fCrops.map(cid => {
                     const c = CROPS[cid];
                     return (
                        <div key={cid} className="cr-card-v24">
                           <div className="cr-t">
                              <img src={c.img} alt={c.en} />
                              <button className="cr-fav-btn active">❤️</button>
                           </div>
                           <div className="cr-b">
                              <h4>{c[L]}</h4>
                              <div className="cr-p">MSP: ₹{c.base.toLocaleString()}</div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>
      </div>
   );
};

export const CompareHubView = ({ L, compareIds, filteredMandis, mktStats, mktData, CROPS, setMainView }) => {
   const mkts = compareIds.map(id => filteredMandis.find(m => m.id === id)).filter(Boolean);

   // Analytical: Find best prices for each shared crop
   const sharedCrops = useMemo(() => {
      const allCids = mkts.flatMap(m => m.crops);
      const uniqueCids = [...new Set(allCids)];
      return uniqueCids.filter(cid => mkts.every(m => m.crops.includes(cid)));
   }, [mkts]);

   const arbitrageData = useMemo(() => {
      const data = {};
      sharedCrops.forEach(cid => {
         const prices = mkts.map(m => ({ mid: m.id, val: mktData[m.id]?.[cid]?.live || 0 }));
         const max = Math.max(...prices.map(p => p.val));
         const avg = prices.reduce((a, b) => a + b.val, 0) / prices.length;
         data[cid] = { max, avg, mid: prices.find(p => p.val === max)?.mid };
      });
      return data;
   }, [sharedCrops, mkts, mktData]);

   // Identify the "Winner" Market
   const winnerMarket = useMemo(() => {
      if (mkts.length < 2) return null;
      const scores = mkts.map(m => {
         let s = 0;
         // Price score
         sharedCrops.forEach(cid => { if (arbitrageData[cid]?.mid === m.id) s += 10; });
         // Traffic score
         const traffic = mktStats[m.id]?.total || 0;
         if (traffic < 40) s += 15;
         else if (traffic < 80) s += 5;
         // Distance score
         if (m.distance && m.distance < 30) s += 20;
         return { id: m.id, score: s };
      });
      const maxScore = Math.max(...scores.map(x => x.score));
      return scores.find(x => x.score === maxScore)?.id;
   }, [mkts, sharedCrops, arbitrageData, mktStats]);

   if (mkts.length === 0) {
      return (
         <div className="hub-full-page animate-in">
            <div className="hub-header">
               <h2>⚖️ {L === 'mr' ? 'मार्केट तुलना' : 'Market Comparison'}</h2>
               <p>{L === 'mr' ? 'तुलना करण्यासाठी होम पेजवरून २-३ मार्केट निवडा.' : 'Select 2-3 markets from the home page to compare.'}</p>
               <button className="btn-home-nav" onClick={() => setMainView('home')} style={{ marginTop: '20px' }}>
                  {L === 'mr' ? '← मार्केट निवडा' : '← Select Markets'}
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="hub-full-page compare-hub animate-in">
         <div className="hub-header">
            <div className="hub-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
               <div className="hub-badge-v25">{L === 'mr' ? 'स्मार्ट तुलना' : 'Smart Comparison'}</div>
               <button className="mc-fav-btn2" onClick={() => setMainView('home')}>
                  ← {L === 'mr' ? 'मार्केट लिस्टवर जा' : 'Back to Market List'}
               </button>
            </div>
            <h2>⚖️ {L === 'mr' ? 'मार्केट प्रॉफिट अ‍ॅनालिसिस' : 'Market Profit Analysis'}</h2>
            <p>{mkts.length} {L === 'mr' ? 'निवडलेली मार्केट' : 'Markets analyzed for best profit'}</p>
         </div>

         {/* 🏆 RECOMMENDATION CARD */}
         <div className="ch-recommendation-v26 animate-in">
            <div className="chr-l">
               <span className="chr-badge">🏆 {L === 'mr' ? 'सर्वोत्कृष्ट निवड' : 'BEST CHOICE'}</span>
               <h3>{mkts.find(m => m.id === winnerMarket)?.name[L]}</h3>
               <p>{L === 'mr' ? 'हा बाजार भाव आणि वाहतूक सुविधेनुसार फायदेशीर आहे.' : 'Based on prices, traffic, and proximity, this market is ideal today.'}</p>
            </div>
            <div className="chr-r">
               <div className="profit-stat">
                  <span>{L === 'mr' ? 'अतिरिक्त नफा' : 'Est. More Profit'}</span>
                  <b>+₹1,450*</b>
               </div>
            </div>
         </div>

         <div className="ch-grid" style={{ gridTemplateColumns: `repeat(${mkts.length}, 1fr)` }}>
            {mkts.map((m, idx) => {
               const stats = mktStats[m.id] || { trucks: 0, tractors: 0, total: 0 };
               const isWinner = m.id === winnerMarket;

               return (
                  <div key={m.id} className={`ch-col ${isWinner ? 'ch-best-deal' : ''}`}>
                     {isWinner && <div className="ch-badge">⭐ {L === 'mr' ? 'शिफारस' : 'Recommended'}</div>}

                     <div className="ch-h">
                        <span className="ch-dist">📍 {m.location[L]} {m.distance ? `(${m.distance}km)` : ''}</span>
                        <h3>{m.name[L]}</h3>
                        <div className="ch-traffic-meter">
                           <div className="traffic-bar" style={{ width: `${Math.min(100, stats.total)}%`, background: stats.total > 70 ? '#ef4444' : '#22c55e' }}></div>
                        </div>
                        <p className={stats.total > 70 ? 't-bad' : 't-good'}>
                           {stats.total} {L === 'mr' ? 'वाहने वेटिंग' : 'Vehicles waiting'}
                        </p>
                     </div>

                     <div className="ch-body">
                        <div className="ch-metrics">
                           <div className="ch-metric">
                              <span>{L === 'mr' ? 'ट्रक' : 'Trucks'}</span>
                              <b>{stats.trucks}</b>
                           </div>
                           <div className="ch-metric">
                              <span>{L === 'mr' ? 'ट्रॅक्टर' : 'Tractors'}</span>
                              <b>{stats.tractors}</b>
                           </div>
                        </div>

                        <div className="ch-crops-list">
                           <h4>{L === 'mr' ? 'विश्लेषणात्मक भाव' : 'Analytical Rates'}</h4>
                           {m.crops.slice(0, 15).map(cid => {
                              const c = CROPS[cid];
                              const live = mktData[m.id]?.[cid]?.live;
                              if (!c || !live) return null;
                              const isHighest = arbitrageData[cid]?.mid === m.id;
                              const diff = live - arbitrageData[cid]?.avg;

                              return (
                                 <div key={cid} className={`ch-crop-item ${isHighest ? 'is-arbitrage' : ''}`}>
                                    <div className="cci-l">
                                       <span>{c.icon}</span> <span>{c[L]}</span>
                                    </div>
                                    <div className="cci-r">
                                       <b>₹{live.toLocaleString()}</b>
                                       {isHighest ? (
                                          <span className="best-price-indicator">🔥</span>
                                       ) : (
                                          <span className="price-diff-tag">-{Math.abs(Math.round(diff))}</span>
                                       )}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>

         {/* 📊 MARKET ANALYTICAL MATRIX */}
         <div className="ch-matrix-v26 animate-up">
            <h3>📊 {L === 'mr' ? 'मार्केट तुलनात्मक विश्लेषण' : 'Market Comparative Analysis'}</h3>
            <div className="mx-table">
               <div className="mx-row mx-head">
                  <div className="mx-cell feat">{L === 'mr' ? 'वैशिष्ट्ये' : 'Features'}</div>
                  {mkts.map(m => <div key={m.id} className="mx-cell">{m.name[L]}</div>)}
               </div>
               <div className="mx-row">
                  <div className="mx-cell feat">🕒 {L === 'mr' ? 'लिलावाची वेळ' : 'Auction Peak Time'}</div>
                  {mkts.map(m => <div key={m.id} className="mx-cell">{m.id % 2 === 0 ? (L === 'mr' ? 'सकाळी ७-१०' : '7 AM - 10 AM') : (L === 'mr' ? ' पहाटे ४-८' : '4 AM - 8 AM')}</div>)}
               </div>
               <div className="mx-row">
                  <div className="mx-cell feat">🏙️ {L === 'mr' ? 'मार्केट क्षमता' : 'Market Capacity'}</div>
                  {mkts.map(m => <div key={m.id} className="mx-cell">{mktStats[m.id]?.total > 60 ? (L === 'mr' ? 'मोठी (Huge)' : 'Huge') : (L === 'mr' ? 'मध्यम (Mid)' : 'Medium')}</div>)}
               </div>
               <div className="mx-row">
                  <div className="mx-cell feat">⚙️ {L === 'mr' ? 'सोयीसुविधा' : 'Key Facilities'}</div>
                  {mkts.map(m => <div key={m.id} className="mx-cell">{L === 'mr' ? 'डिजीटल वजन/कोल्ड स्टोरेज' : 'Digital Weigh/Cold Storage'}</div>)}
               </div>
               <div className="mx-row">
                  <div className="mx-cell feat">🚜 {L === 'mr' ? 'शेतकरी पसंती' : 'Farmer Rating'}</div>
                  {mkts.map(m => <div key={m.id} className="mx-cell">⭐⭐⭐⭐{m.id % 2 === 0 ? '⭐' : ''}</div>)}
               </div>
            </div>
         </div>
      </div>
   );
};

export const SellerDashboardView = ({ L, setMainView }) => {
   const [products, setProducts] = React.useState([
      { id: 1, name: L === 'mr' ? 'कांदा (लाल)' : 'Onion (Red)', qty: 50, unit: L === 'mr' ? 'क्विंटल' : 'Quintal', status: 'In Stock', price: 1800 },
      { id: 2, name: L === 'mr' ? 'टोमॅटो' : 'Tomato', qty: 200, unit: L === 'mr' ? 'किलो' : 'Kg', status: 'Limited', price: 25 },
   ]);
   const [isAdding, setIsAdding] = React.useState(false);

   const handleAddProduct = (e) => {
      e.preventDefault();
      const pName = e.target.pName.value;
      const pQty = e.target.pQty.value;
      const pUnit = e.target.pUnit.value;
      const pPrice = e.target.pPrice.value;
      if (!pName) return;
      setProducts([...products, { id: Date.now(), name: pName, qty: pQty, unit: pUnit, price: pPrice, status: 'In Stock' }]);
      setIsAdding(false);
      e.target.reset();
   };

   return (
      <div className="hub-full-page animate-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
         <div className="hub-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #064e3b, #059669)', color: 'white', borderRadius: '25px', padding: '30px' }}>
            <div>
               <h2 style={{ color: 'white' }}>👨‍🌾 {L === 'mr' ? 'शेतकरी डॅशबोर्ड' : 'Farmer Dashboard'}</h2>
               <p style={{ color: 'rgba(255,255,255,0.8)' }}>{L === 'mr' ? 'तुमची इन्व्हेंटरी आणि ऑर्डर व्यवस्थापित करा' : 'Manage your inventory and orders'}</p>
            </div>
            <button className="mc-fav-btn2" onClick={() => setMainView('home')} style={{ color: '#064e3b' }}>← {L === 'mr' ? 'मुख्यपृष्ठ' : 'Home'}</button>
         </div>

         <div className="hub-section" style={{ marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <h3 style={{ fontSize: '1.5rem', fontWeight: '950' }}>📦 {L === 'mr' ? 'माझी इन्व्हेंटरी' : 'My Inventory'}</h3>
               <button onClick={() => setIsAdding(!isAdding)} style={{ background: '#059669', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', fontWeight: '950', cursor: 'pointer', boxShadow: '0 10px 20px rgba(5,150,105,0.2)' }}>
                  ➕ {L === 'mr' ? 'माल जोडा' : 'Add Product'}
               </button>
            </div>

            {isAdding && (
               <form onSubmit={handleAddProduct} className="mgt-active-list animate-in" style={{ marginBottom: '25px', display: 'flex', gap: '15px', padding: '25px', flexWrap: 'wrap', background: 'var(--mh-card)' }}>
                  <input name="pName" placeholder={L === 'mr' ? 'पिकाचे नाव (उदा. कांदा)' : 'Crop Name'} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: '2px solid var(--mh-border)', outline: 'none', background: 'var(--mh-bg)', color: 'var(--mh-text)' }} required />
                  <input name="pQty" type="number" placeholder={L === 'mr' ? 'प्रमाण' : 'Qty'} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid var(--mh-border)', outline: 'none', background: 'var(--mh-bg)', color: 'var(--mh-text)' }} required />
                  <select name="pUnit" style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid var(--mh-border)', outline: 'none', background: 'var(--mh-bg)', color: 'var(--mh-text)' }}>
                     <option value={L === 'mr' ? 'क्विंटल' : 'Quintal'}>{L === 'mr' ? 'क्विंटल' : 'Quintal'}</option>
                     <option value={L === 'mr' ? 'किलो' : 'Kg'}>{L === 'mr' ? 'किलो' : 'Kg'}</option>
                  </select>
                  <input name="pPrice" type="number" placeholder={L === 'mr' ? 'भाव' : 'Price'} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid var(--mh-border)', outline: 'none', background: 'var(--mh-bg)', color: 'var(--mh-text)' }} required />
                  <button type="submit" style={{ background: '#0284c7', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', fontWeight: '950', cursor: 'pointer' }}>
                     {L === 'mr' ? 'सेव्ह करा' : 'Save'}
                  </button>
               </form>
            )}

            <div className="mx-table" style={{ background: 'var(--mh-card)' }}>
               <div className="mx-row mx-head" style={{ background: 'var(--mh-bg)', fontWeight: '950' }}>
                  <div className="mx-cell">{L === 'mr' ? 'शेतमाल' : 'Crop'}</div>
                  <div className="mx-cell">{L === 'mr' ? 'प्रमाण' : 'Quantity'}</div>
                  <div className="mx-cell">{L === 'mr' ? 'भाव' : 'Price'}</div>
                  <div className="mx-cell">{L === 'mr' ? 'स्थिती' : 'Status'}</div>
                  <div className="mx-cell">{L === 'mr' ? 'कृती' : 'Action'}</div>
               </div>
               {products.map(p => (
                  <div key={p.id} className="mx-row" style={{ borderBottom: '1px solid var(--mh-border)' }}>
                     <div className="mx-cell" style={{ fontSize: '1.1rem' }}><b>{p.name}</b></div>
                     <div className="mx-cell" style={{ fontWeight: '800', color: 'var(--mh-text-light)' }}>{p.qty} {p.unit}</div>
                     <div className="mx-cell" style={{ fontWeight: '950', color: '#059669' }}>₹{p.price}/{p.unit === 'Kg' ? 'Kg' : 'Qtl'}</div>
                     <div className="mx-cell">
                        <span style={{ background: p.status === 'In Stock' ? '#dcfce7' : '#fef3c7', color: p.status === 'In Stock' ? '#166534' : '#92400e', padding: '4px 10px', borderRadius: '10px', fontWeight: '900', fontSize: '0.8rem' }}>
                           {p.status}
                        </span>
                     </div>
                     <div className="mx-cell">
                        <button onClick={() => setProducts(products.filter(x => x.id !== p.id))} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '900', transition: '0.3s' }}>
                           {L === 'mr' ? 'काढून टाका' : 'Remove'}
                        </button>
                     </div>
                  </div>
               ))}
               {products.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mh-text-light)', fontWeight: '900' }}>
                     {L === 'mr' ? 'तुमची इन्व्हेंटरी रिकामी आहे.' : 'Your inventory is empty.'}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};
