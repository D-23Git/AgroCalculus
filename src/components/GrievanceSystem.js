import React, { useState, useEffect } from 'react';
import './GrievanceBoard.css';
import AgroService from '../services/AgroService';

/**
 * GrievanceSystem — लोकसेवा तक्रार निवारण कक्ष (Unified v31)
 * Restored to the exact state of the 'Final Consolidation' turn.
 */
const GrievanceSystem = ({ onClose, lang = 'mr', initialMarket }) => {
  const isAdmin = AgroService.isAdmin();
  const [activeTab, setActiveTab] = useState(isAdmin ? 'board' : 'submit');

  /* ── BOARD / VIEW STATE ── */
  const [reports, setReports] = useState([]);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  /* ── SUBMIT / FORM STATE ── */
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const CATEGORIES = [
    { id: 'price', en: 'Price/Auction Issue', mr: 'भाव / लिलाव समस्या', icon: '💰' },
    { id: 'infra', en: 'Infrastructure Query', mr: 'पायाभूत सुविधा प्रश्न', icon: '🏢' },
    { id: 'merchant', en: 'Merchant Behavior', mr: 'व्यापारी वागणूक', icon: '🤝' },
    { id: 'logistics', en: 'Logistics/Entry Issue', mr: 'वाहतूक / प्रवेश समस्या', icon: '🚛' },
    { id: 'other', en: 'Other Feedback', mr: 'इतर अभिप्राय', icon: '📝' }
  ];

  useEffect(() => {
    refreshData();
  }, [initialMarket]);

  const refreshData = () => {
    let all = AgroService.getGrievances();
    if (initialMarket?.id && !isAdmin) {
      all = all.filter(r => r.marketId === initialMarket.id);
    }
    setReports(all);
  };

  const handleResolve = (id) => {
    AgroService.updateGrievance(id, 'resolved', adminNote || 'Resolved by APMC Administration.');
    setResolveTarget(null);
    setAdminNote('');
    refreshData();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      id: Math.round(1000 + Math.random() * 9000),
      category: CATEGORIES.find(c => c.id === category)?.[lang] || category,
      message: message,
      market: initialMarket?.name[lang] || 'General',
      marketId: initialMarket?.id || null,
      user: AgroService.getProfile()?.name || 'Farmer',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    AgroService.saveGrievance(data);
    setIsSuccess(true);
    refreshData();
    setTimeout(() => {
      setIsSuccess(false);
      setStep(1);
      setCategory('');
      setMessage('');
      setActiveTab('board');
    }, 2500);
  };

  return (
    <div className="gb-overlay" onClick={onClose}>
      <div className="gb-card gs-unified-v31 shadow-premium" onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <header className="gb-header">
          <div className="gb-header-left">
            <span className="gb-icon">{isAdmin ? '🏛️' : '📋'}</span>
            <div>
              <h2 style={{ fontWeight: 950 }}>{lang === 'mr' ? 'निवारण केंद्र' : 'Resolution Center'}</h2>
              <p style={{ fontWeight: 800 }}>{lang === 'mr' ? 'बाजार समिती डिजिटल हेल्पडेस्क' : 'APMC Digital Helpdesk'}</p>
            </div>
          </div>
          <button className="gb-close" onClick={onClose}>✕</button>
        </header>

        {/* TAB NAVIGATION */}
        <div className="gs-tabs-v31">
          <button className={`gs-tab ${activeTab === 'board' ? 'on' : ''}`} onClick={() => setActiveTab('board')}>
            {lang === 'mr' ? (isAdmin ? 'निवारण कक्ष' : 'माझ्या तक्रारी') : (isAdmin ? 'Admin Desk' : 'My Reports')}
          </button>
          {!isAdmin && (
            <button className={`gs-tab ${activeTab === 'submit' ? 'on' : ''}`} onClick={() => { setActiveTab('submit'); setIsSuccess(false); setStep(1); }}>
              {lang === 'mr' ? 'नवीन अर्ज' : 'File Report'}
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="gb-body" style={{ minHeight: '450px' }}>

          {/* ─ TAB: BOARD ─ */}
          {activeTab === 'board' && (
            <div className="gb-reports-grid">
              {reports.length === 0 ? (
                <div className="gb-empty">
                  <div className="empty-ico">📋</div>
                  <p>{lang === 'mr' ? 'कोणतीही तक्रार उपलब्ध नाही.' : 'No reports found.'}</p>
                </div>
              ) : (
                reports.map(r => (
                  <div key={r.id} className={`gb-report-card shadow-sm ${r.status}`}>
                    <div className="gbr-top">
                      <span className="gbr-id">#{r.id}</span>
                      <span className={`gbr-status-tag ${r.status}`}>
                        {r.status === 'resolved' ? (lang === 'mr' ? 'निवारण झाले' : 'Resolved') : (lang === 'mr' ? 'कार्यवाही सुरू' : 'In Progress')}
                      </span>
                    </div>
                    
                    <div className="gbr-journey">
                      <div className={`gj-step ${r.status === 'pending' || r.status === 'resolved' ? 'on' : ''}`}>
                         <div className="gj-dot" />
                         <span>{lang === 'mr' ? 'प्राप्त' : 'Received'}</span>
                      </div>
                      <div className={`gj-step ${r.status === 'resolved' ? 'on' : ''}`}>
                         <div className="gj-dot" />
                         <span>{lang === 'mr' ? 'तपासणी' : 'Verifying'}</span>
                      </div>
                      <div className={`gj-step ${r.status === 'resolved' ? 'on' : ''}`}>
                         <div className="gj-dot" />
                         <span>{lang === 'mr' ? 'पूर्ण' : 'Resolved'}</span>
                      </div>
                    </div>

                    <div className="gbr-main-info">
                       <h4 className="gbr-cat-title">🏷️ {r.category}</h4>
                       <p className="gbr-msg-text">"{r.message}"</p>
                    </div>

                    <div className="gbr-footer-meta">
                       <div className="meta-loc">📍 {r.market}</div>
                       <div className="meta-time">📅 {new Date(r.timestamp).toLocaleDateString()}</div>
                    </div>

                    {r.status === 'pending' && isAdmin && (
                      <button className="gbr-action-btn" onClick={() => setResolveTarget(r.id)}>
                        ⚡ {lang === 'mr' ? 'त्वरित निवारण' : 'Resolve Admin'}
                      </button>
                    )}

                    {r.status === 'resolved' && (
                      <div className="gbr-admin-reply">
                        <div className="reply-header">🏛️ {lang === 'mr' ? 'प्रशासकीय उत्तर:' : 'Official Reply:'}</div>
                        <p>{r.adminNote}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─ TAB: SUBMIT ─ */}
          {activeTab === 'submit' && !isAdmin && (
            <div className="gs-submit-flow">
              {isSuccess ? (
                <div className="gs-success-hub animate-in">
                  <div className="success-ico" style={{ fontSize: '4rem' }}>✅</div>
                  <h3 style={{ fontWeight: 950 }}>{lang === 'mr' ? 'तक्रार यशस्वीरित्या नोंदवली!' : 'Report Filed!'}</h3>
                  <p>{lang === 'mr' ? 'प्रशासन लवकरच कार्यवाही करेल.' : 'Action will be taken shortly.'}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="gs-featured-form">
                  <div className="gs-form-info-row">
                    <div className="info-tag">📍 {initialMarket?.name[lang] || 'General'}</div>
                    <div className="info-tag user-tag">👤 {AgroService.getProfile()?.name || 'Farmer'}</div>
                  </div>

                  {step === 1 && (
                    <div className="gs-step animate-in">
                      <h4 style={{ marginBottom: '20px', fontWeight: 950 }}>{lang === 'mr' ? 'तक्रारीचा प्रकार निवडा:' : 'Select Category:'}</h4>
                      <div className="gs-cat-grid">
                        {CATEGORIES.map(c => (
                          <div key={c.id} className={`gs-cat-opt ${category === c.id ? 'on' : ''}`} onClick={() => setCategory(c.id)}>
                            <span className="sc-ico">{c.icon}</span>
                            <b>{c[lang]}</b>
                            <span className="sc-chk">{category === c.id ? '✅' : '○'}</span>
                          </div>
                        ))}
                      </div>
                      <button type="button" className="base-btn-v31" disabled={!category} onClick={() => setStep(2)}>
                        {lang === 'mr' ? 'पुढील' : 'Next Step'} →
                      </button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="gs-step animate-in">
                      <button type="button" onClick={() => setStep(1)} className="back-link-v31">← {lang === 'mr' ? 'मागे' : 'Back'}</button>
                      <h4 style={{ margin: '20px 0', fontWeight: 950 }}>{lang === 'mr' ? 'आपल्या समस्येचे वर्णन करा:' : 'Describe the issue:'}</h4>
                      <textarea required className="gs-textarea-v31" value={message} onChange={e => setMessage(e.target.value)} placeholder={lang === 'mr' ? 'येथे तपशील लिहा...' : 'Type here...'} />
                      <button type="submit" className="base-btn-v31 submit">🚀 {lang === 'mr' ? 'तक्रार नोंदवा' : 'Submit Report'}</button>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>

        {/* ADMIN RESOLVE MODAL */}
        {resolveTarget && (
          <div className="gb-modal-mini" onClick={() => setResolveTarget(null)}>
            <div className="gmm-content shadow-premium animate-in" onClick={e => e.stopPropagation()}>
              <h3>{lang === 'mr' ? 'निवारण टिपणी' : 'Resolution Note'}</h3>
              <textarea placeholder={lang === 'mr' ? 'येथे तपशील भरा...' : 'Enter details...'} value={adminNote} onChange={e => setAdminNote(e.target.value)} />
              <div className="gmm-btns">
                <button className="cancel" onClick={() => setResolveTarget(null)}>{lang === 'mr' ? 'रद्द' : 'Cancel'}</button>
                <button className="confirm" onClick={() => handleResolve(resolveTarget)}>{lang === 'mr' ? 'निवारण पूर्ण करा' : 'Mark Resolved'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .gs-tabs-v31 { display: flex; gap: 10px; padding: 15px 30px; border-bottom: 2px solid #edf2f7; background: #f8fafc; }
        .gs-tab { flex: 1; padding: 12px; border: none; background: white; border-radius: 12px; font-weight: 950; cursor: pointer; transition: 0.3s; border: 2px solid #edf2f7; color: #64748b; }
        .gs-tab.on { background: #111827; color: white; border-color: #111827; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .gs-cat-opt { display: flex; align-items: center; gap: 15px; padding: 16px; background: white; border: 2px solid #e2e8f0; border-radius: 15px; cursor: pointer; margin-bottom: 10px; transition: 0.2s; }
        .gs-cat-opt.on { border-color: #138808; background: #f0fdf4; }
        .sc-chk { margin-left: auto; font-weight: 950; }
        .gs-textarea-v31 { width: 100%; height: 140px; border: 2px solid #e2e8f0; border-radius: 15px; padding: 20px; margin-bottom: 20px; outline: none; font-weight: 800; }
        .base-btn-v31 { width: 100%; background: #111827; color: white; border: none; padding: 18px; border-radius: 15px; font-weight: 950; cursor: pointer; transition: 0.3s; margin-top: 15px; }
        .base-btn-v31.submit { background: #138808; }
        .back-link-v31 { background: none; border: none; color: #3b82f6; font-weight: 950; cursor: pointer; font-size: 1rem; }
        .shadow-premium { box-shadow: 0 40px 100px rgba(0,0,0,0.15) !important; }
      `}</style>
    </div>
  );
};

export default GrievanceSystem;
