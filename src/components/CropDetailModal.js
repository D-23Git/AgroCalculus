import React from 'react';
import './CropDetailModal.css';

const CropDetailModal = ({ crop, data, lang, onClose }) => {
  if (!crop || !data) return null;

  const L = lang || 'mr';
  const priceKg = (data.modal / 100).toFixed(1);

  return (
    <div className="cdm-overlay" onClick={onClose}>
      <div className="cdm-content animate-in" onClick={e => e.stopPropagation()}>
        <button className="cdm-close" onClick={onClose}>×</button>
        
        <header className="cdm-header">
          <div className="cdm-visual">
            <span role="img" aria-label={crop.en}>{crop.icon}</span>
          </div>
          <div className="cdm-title-area">
            <h1>{crop[L]}</h1>
            <div className="cdm-tag-row">
              <span className="cdm-badge premium">{L === 'mr' ? 'प्रीमियम क्वालिटी' : 'Premium Quality'}</span>
              <span className="cdm-badge trending">🔥 {L === 'mr' ? 'तेजीमध्ये' : 'Trending Up'}</span>
            </div>
          </div>
        </header>

        <div className="cdm-body">
          <div className="cdm-col-left">
            <span className="cdm-section-title">{L === 'mr' ? 'आजचे बाजार भाव' : 'Today\'s Market Rates'}</span>
            <div className="cdm-price-grid">
              <div className="cdm-price-box">
                <span className="unit">{L === 'mr' ? 'प्रति क्विंटल' : 'Per Quintal'}</span>
                <h3>₹{data.modal?.toLocaleString()}</h3>
              </div>
              <div className="cdm-price-box kg">
                <span className="unit">{L === 'mr' ? 'प्रति किलो (Retail)' : 'Per Kg (Retail)'}</span>
                <h3>₹{priceKg}</h3>
              </div>
            </div>

            <span className="cdm-section-title">{L === 'mr' ? 'भावाचा कल (७ दिवस)' : 'Price Trend (7 Days)'}</span>
            <div className="cdm-chart-area">
              <div className="cdm-chart-mock">
                {/* SVG Sparkline simulating a premium chart */}
                <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.2 }} />
                      <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M0,25 L15,20 L30,22 L45,15 L60,10 L75,18 L90,5 L100,8" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M0,25 L15,20 L30,22 L45,15 L60,10 L75,18 L90,5 L100,8 L100,30 L0,30 Z" fill="url(#grad)" />
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>
                <span>MON</span><span>WED</span><span>FRI</span><span>SUN</span>
              </div>
            </div>

            <div className="cdm-advisory">
              <span className="cdm-section-title" style={{ color: '#92400e', marginBottom: '10px' }}>
                💡 {L === 'mr' ? 'तज्ज्ञांचा सल्ला' : 'Expert Advisory'}
              </span>
              <p>
                {L === 'mr' 
                  ? `${crop.mr}ची साठवणूक कोरड्या जागी करा. सध्या बाजारात चांगली मागणी असून येत्या ३-४ दिवसात भाव स्थिर राहण्याची शक्यता आहे.`
                  : `Store your ${crop.en} in a cool, dry place. Market demand is currently high; prices are expected to remain stable for the next 3-4 days.`
                }
              </p>
            </div>
          </div>

          <div className="cdm-col-right">
            <span className="cdm-section-title">{L === 'mr' ? 'पिकाची माहिती' : 'Crop Specifications'}</span>
            <div className="cdm-specs">
              <div className="cdm-spec-item">
                <span>{L === 'mr' ? 'प्रत (Grade)' : 'Quality Grade'}</span>
                <b>A1 (Export)</b>
              </div>
              <div className="cdm-spec-item">
                <span>{L === 'mr' ? 'आद्रता (Moisture)' : 'Moisture'}</span>
                <b>12-14%</b>
              </div>
              <div className="cdm-spec-item">
                <span>{L === 'mr' ? 'आकार (Size)' : 'Avg. Size'}</span>
                <b>Medium-Large</b>
              </div>
              <div className="cdm-spec-item">
                <span>{L === 'mr' ? 'आजची आवक' : 'Arrivals Today'}</span>
                <b>{data.arrival} Q</b>
              </div>
            </div>

            <div style={{ marginTop: '40px' }}>
              <span className="cdm-section-title">{L === 'mr' ? 'त्वरीत कृती' : 'Quick Actions'}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button style={{ background: '#064e3b', color: 'white', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                  📞 {L === 'mr' ? 'व्यापाऱ्याशी बोला' : 'Call Authorized Trader'}
                </button>
                <button style={{ background: '#f1f5f9', color: '#0f172a', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                  📤 {L === 'mr' ? 'दर शेअर करा' : 'Share Rates'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetailModal;
