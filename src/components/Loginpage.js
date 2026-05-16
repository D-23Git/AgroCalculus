import React, { useState, useMemo } from "react";
import "./Loginpage.css";
import api from "../utils/apiService";
import { DISTRICTS, ALL_DISTRICTS } from './MarketData';

const selectStyle = {
  width: '100%', padding: '12px', borderRadius: '10px',
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
  color: 'white', fontSize: '0.95rem'
};

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState("login");          // "login" | "register"
  const [signupRole, setSignupRole] = useState(null); // null | "farmer" | "officer"
  const [authMethod, setAuthMethod] = useState("email");
  const [otpSent, setOtpSent] = useState(false);
  const [lang, setLang] = useState("mr");
  const [form, setForm] = useState({ name: "", phone: "", email: "", village: "", acres: "", otp: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Officer cascading selection
  const [offDist, setOffDist] = useState('');
  const [offTal, setOffTal] = useState('');
  const [offMarket, setOffMarket] = useState('');
  const [offStaffId, setOffStaffId] = useState('APMC101');

  const offTalukas = useMemo(() => {
    if (!offDist || !DISTRICTS[offDist]) return [];
    return Object.entries(DISTRICTS[offDist].talukas).map(([key, val]) => ({ key, name: val.name }));
  }, [offDist]);

  const offMarkets = useMemo(() => {
    if (!offDist || !offTal || !DISTRICTS[offDist]?.talukas[offTal]) return [];
    return DISTRICTS[offDist].talukas[offTal].markets || [];
  }, [offDist, offTal]);

  // Same PIN hash as backend
  const autoPin = useMemo(() => {
    if (!offMarket) return '';
    let hash = 0;
    for (let i = 0; i < offMarket.length; i++) {
      hash = ((hash << 5) - hash) + offMarket.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 10000).toString().padStart(4, '0');
  }, [offMarket]);

  const T = {
    en: {
      tagline: "Your Digital Farming Partner",
      login: "Login", register: "Sign Up",
      name: "Full Name", phone: "Mobile Number", email: "Email Address",
      village: "Village", acres: "Acres",
      sendBtn: "Send OTP →", verifyBtn: "Verify & Start →",
      otpLabel: "Enter 6-digit OTP",
      err_phone: "Please enter a valid 10-digit number",
      err_email: "Please enter a valid email address",
      err_otp: "OTP is incorrect",
      otpSentMsg: "OTP sent! Check your inbox.",
      who: "Who are you?", farmer: "🌾 Farmer", officer: "🏪 APMC Officer",
    },
    mr: {
      tagline: "तुमचा डिजिटल शेती सोबती",
      login: "लॉगिन", register: "नोंदणी",
      name: "पूर्ण नाव", phone: "मोबाईल नंबर", email: "ईमेल आयडी",
      village: "गाव / तालुका", acres: "शेत आकार (एकर)",
      sendBtn: "ओटीपी पाठवा →", verifyBtn: "ओटीपी तपासा आणि सुरू करा →",
      otpLabel: "६ अंकी ओटीपी टाका",
      err_phone: "कृपया १० अंकी नंबर टाका",
      err_email: "कृपया योग्य ईमेल टाका",
      err_otp: "ओटीपी चुकीचा आहे",
      otpSentMsg: "ओटीपी पाठवला! तुमचा इमेल तपासा.",
      who: "तुम्ही कोण आहात?", farmer: "🌾 शेतकरी", officer: "🏪 मंडई प्रशासक",
    }
  };
  const t = T[lang];
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const resetMode = (newMode) => {
    setMode(newMode);
    setSignupRole(null);
    setOtpSent(false);
    setError("");
    setOffDist(''); setOffTal(''); setOffMarket('');
  };

  const handleSendOtp = async () => {
    setError("");
    if (authMethod === 'mobile' && !/^\d{10}$/.test(form.phone)) return setError(t.err_phone);
    if (authMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError(t.err_email);
    setLoading(true);
    const res = await api.sendOtp(authMethod === 'email' ? { email: form.email } : { mobile: form.phone });
    setLoading(false);
    if (res.error) {
      setError(res.error === "Server unreachable" ? (lang === 'mr' ? 'सर्वरशी संपर्क होत नाही' : 'Server unreachable') : res.msg || res.error);
    } else {
      setOtpSent(true);
      alert(t.otpSentMsg + (authMethod === 'email' ? ' (Check Inbox/Spam)' : ' (Check Terminal)'));
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!form.otp || form.otp.length < 6) return setError(t.err_otp);
    setLoading(true);
    const res = await api.verifyOtp(
      authMethod === 'email' ? { email: form.email } : { mobile: form.phone },
      form.otp,
      mode === "register" ? form.name : null,
      signupRole // Pass the selected role
    );
    setLoading(false);
    if (res.error) return setError(res.msg || res.error);
    const profile = { ...res.user, village: form.village || "—", acres: form.acres || "—" };
    localStorage.setItem("agro_token", res.token);
    localStorage.setItem("agro_profile", JSON.stringify(profile));
    onLogin(profile);
  };

  const handleOfficerLogin = async () => {
    if (!offMarket) { setError(lang === 'mr' ? 'कृपया मंडी निवडा' : 'Please select a Mandi'); return; }
    setLoading(true); setError("");
    try {
      const res = await api.staffLogin({ staffId: offStaffId, pin: autoPin, mandiId: offMarket });
      if (res.error || res.msg === 'Invalid PIN') {
        setError(lang === 'mr' ? 'लॉगिन अयशस्वी. पुन्हा प्रयत्न करा.' : 'Login failed. Please try again.');
      } else {
        onLogin({ role: 'staff', mandiId: offMarket, name: offStaffId });
      }
    } catch { setError("Server error"); }
    setLoading(false);
  };

  return (
    <div className="lp-root">
      <div className="lp-bg" />

      <div className="lp-lang">
        <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
        <button className={lang === "mr" ? "on" : ""} onClick={() => setLang("mr")}>मराठी</button>
      </div>

      <div className="lp-card animate-in">
        <div className="lp-logo">
          <span className="lp-logo-icon">🌿</span>
          <span className="lp-logo-txt">AgroMaster</span>
        </div>
        <p className="lp-tagline">{t.tagline}</p>

        {/* TABS: Only Login & Sign Up */}
        <div className="lp-tabs">
          <button className={mode === "login" ? "on" : ""} onClick={() => resetMode("login")}>{t.login}</button>
          <button className={mode === "register" ? "on" : ""} onClick={() => resetMode("register")}>{t.register}</button>
        </div>

        <div className="lp-form">

          {/* ── SIGN UP FLOW ── */}
          {mode === "register" && (
            <>
              {/* STEP 1: Who are you? */}
              {!signupRole && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '18px', fontWeight: 600 }}>
                    {t.who}
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setSignupRole('farmer')} style={{
                      flex: 1, padding: '20px 10px', borderRadius: '14px',
                      background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                      color: '#34d399', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      🌾<br /><span style={{ fontSize: '0.85rem' }}>{lang === 'mr' ? 'शेतकरी' : 'Farmer'}</span>
                    </button>
                    <button onClick={() => setSignupRole('officer')} style={{
                      flex: 1, padding: '20px 10px', borderRadius: '14px',
                      background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)',
                      color: '#818cf8', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      🏪<br /><span style={{ fontSize: '0.85rem' }}>{lang === 'mr' ? 'मंडई प्रशासक' : 'APMC Officer'}</span>
                    </button>
                    <button onClick={() => setSignupRole('admin')} style={{
                      flex: 1, padding: '20px 10px', borderRadius: '14px',
                      background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)',
                      color: '#fbbf24', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      👑<br /><span style={{ fontSize: '0.85rem' }}>{lang === 'mr' ? 'अॅडमिन' : 'Admin'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2A: Farmer Sign Up */}
              {signupRole === 'farmer' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <button onClick={() => setSignupRole(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>🌾 {lang === 'mr' ? 'शेतकरी नोंदणी' : 'Farmer Sign Up'}</span>
                  </div>

                  {/* Email/Mobile toggle */}
                  {!otpSent && (
                    <div className="lp-method-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      <button type="button" onClick={() => setAuthMethod('email')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--dl-border)', background: authMethod === 'email' ? 'var(--dl-indigo)' : 'transparent', color: authMethod === 'email' ? 'white' : 'var(--dl-text-muted)', cursor: 'pointer' }}>📧 Email</button>
                      <button type="button" onClick={() => setAuthMethod('mobile')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--dl-border)', background: authMethod === 'mobile' ? 'var(--dl-indigo)' : 'transparent', color: authMethod === 'mobile' ? 'white' : 'var(--dl-text-muted)', cursor: 'pointer' }}>📱 Mobile</button>
                    </div>
                  )}

                  <div className="lp-field">
                    <label>{t.name}</label>
                    <input type="text" placeholder="Darshan Badhe" value={form.name} onChange={e => set("name", e.target.value)} disabled={otpSent} />
                  </div>

                  {authMethod === 'email' ? (
                    <div className="lp-field">
                      <label>{t.email}</label>
                      <input type="email" placeholder="example@gmail.com" value={form.email} onChange={e => set("email", e.target.value)} disabled={otpSent} />
                    </div>
                  ) : (
                    <div className="lp-field">
                      <label>{t.phone}</label>
                      <input type="tel" placeholder="9373082323" value={form.phone} onChange={e => set("phone", e.target.value)} disabled={otpSent} />
                    </div>
                  )}

                  <div className="lp-row">
                    <div className="lp-field"><label>{t.village}</label><input type="text" placeholder="Waghale" value={form.village} onChange={e => set("village", e.target.value)} disabled={otpSent} /></div>
                    <div className="lp-field"><label>{t.acres}</label><input type="number" placeholder="4" value={form.acres} onChange={e => set("acres", e.target.value)} disabled={otpSent} /></div>
                  </div>

                  {!otpSent ? (
                    <button className="lp-submit" onClick={handleSendOtp} disabled={loading}>{loading ? "..." : t.sendBtn}</button>
                  ) : (
                    <div className="lp-otp-section animate-in" style={{ marginTop: '10px' }}>
                      <div className="lp-field">
                        <label style={{ color: 'var(--dl-emerald)' }}>✔️ {t.otpLabel}</label>
                        <input type="tel" placeholder="------" maxLength={6} value={form.otp} onChange={e => set("otp", e.target.value)} autoFocus
                          style={{ fontSize: '2rem', textAlign: 'center', letterSpacing: '10px', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--dl-emerald)' }} />
                      </div>
                      <button className="lp-submit" style={{ background: 'var(--dl-emerald)' }} onClick={handleVerifyOtp} disabled={loading}>{loading ? "..." : t.verifyBtn}</button>
                      <p style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '10px', color: 'var(--dl-text-muted)', cursor: 'pointer' }} onClick={() => setOtpSent(false)}>
                        {lang === 'mr' ? 'माहिती बदला' : 'Change Info'}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* STEP 2B: Officer Sign Up */}
              {signupRole === 'officer' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <button onClick={() => setSignupRole(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
                    <span style={{ color: '#818cf8', fontWeight: 600 }}>🏪 {lang === 'mr' ? 'मंडई प्रशासक लॉगिन' : 'APMC Officer Login'}</span>
                  </div>

                  <div className="lp-field">
                    <label>{lang === 'mr' ? "स्टाफ आयडी" : "Staff ID"}</label>
                    <input type="text" value={offStaffId} onChange={e => setOffStaffId(e.target.value)}
                      style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.5)', color: 'white' }} />
                  </div>

                  <div className="lp-field">
                    <label>{lang === 'mr' ? "जिल्हा निवडा" : "Select District"}</label>
                    <select value={offDist} onChange={e => { setOffDist(e.target.value); setOffTal(''); setOffMarket(''); }} style={selectStyle}>
                      <option value="">{lang === 'mr' ? '-- जिल्हा निवडा --' : '-- Select District --'}</option>
                      {ALL_DISTRICTS.map(d => (
                        <option key={d.id} value={d.id} style={{ background: '#1e1e2e' }}>
                          {d.icon} {lang === 'mr' ? d.mr : d.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {offDist && (
                    <div className="lp-field">
                      <label>{lang === 'mr' ? "तालुका निवडा" : "Select Taluka"}</label>
                      <select value={offTal} onChange={e => { setOffTal(e.target.value); setOffMarket(''); }} style={selectStyle}>
                        <option value="">{lang === 'mr' ? '-- तालुका निवडा --' : '-- Select Taluka --'}</option>
                        {offTalukas.map(tk => (
                          <option key={tk.key} value={tk.key} style={{ background: '#1e1e2e' }}>
                            {lang === 'mr' ? tk.name.mr : tk.name.en}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {offTal && (
                    <div className="lp-field">
                      <label>{lang === 'mr' ? "मंडी / मार्केट निवडा" : "Select Mandi / Market"}</label>
                      <select value={offMarket} onChange={e => setOffMarket(e.target.value)} style={selectStyle}>
                        <option value="">{lang === 'mr' ? '-- मंडी निवडा --' : '-- Select Mandi --'}</option>
                        {offMarkets.map(m => (
                          <option key={m.id} value={m.id} style={{ background: '#1e1e2e' }}>
                            {lang === 'mr' ? m.name.mr : m.name.en}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {offMarket && (
                    <div className="lp-field">
                      <label>{lang === 'mr' ? "पिन — आपोआप तयार होतो" : "PIN — Auto Generated"}</label>
                      <div style={{
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)',
                        borderRadius: '10px', padding: '14px', letterSpacing: '10px',
                        fontSize: '1.6rem', textAlign: 'center', color: '#34d399', fontWeight: 800
                      }}>{autoPin}</div>
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '5px', textAlign: 'center' }}>
                        {lang === 'mr' ? 'हा पिन फक्त या मंडईसाठी आहे' : 'This PIN is specific to your selected Mandi'}
                      </p>
                    </div>
                  )}

                  <button className="lp-submit" onClick={handleOfficerLogin} disabled={loading || !offMarket}
                    style={{ background: offMarket ? 'linear-gradient(135deg,#6366f1,#818cf8)' : undefined }}>
                    {loading ? "..." : (lang === 'mr' ? "मंडईत प्रवेश करा 🏪" : "Enter Mandi 🏪")}
                  </button>
                </>
              )}

              {/* STEP 2C: Admin Login */}
              {signupRole === 'admin' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <button onClick={() => setSignupRole(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
                    <span style={{ color: '#fbbf24', fontWeight: 600 }}>👑 {lang === 'mr' ? 'अॅडमिन लॉगिन' : 'Admin Login'}</span>
                  </div>

                  <div className="lp-field">
                    <label>{lang === 'mr' ? "अॅडमिन ईमेल आयडी" : "Admin Email Address"}</label>
                    <input type="email" placeholder="admin@example.com" value={form.email} 
                      onChange={e => { set("email", e.target.value); setAuthMethod('email'); }} disabled={otpSent}
                      style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.5)', color: 'white' }} />
                  </div>

                  {!otpSent ? (
                    <button className="lp-submit" onClick={handleSendOtp} disabled={loading}
                      style={{ background: 'linear-gradient(135deg,#d97706,#fbbf24)' }}>
                      {loading ? "..." : t.sendBtn}
                    </button>
                  ) : (
                    <div className="lp-otp-section animate-in" style={{ marginTop: '10px' }}>
                      <div className="lp-field">
                        <label style={{ color: '#fbbf24' }}>✔️ {t.otpLabel}</label>
                        <input type="tel" placeholder="------" maxLength={6} value={form.otp} onChange={e => set("otp", e.target.value)} autoFocus
                          style={{ fontSize: '2rem', textAlign: 'center', letterSpacing: '10px', background: 'rgba(245, 158, 11, 0.1)', borderColor: '#fbbf24' }} />
                      </div>
                      <button className="lp-submit" style={{ background: '#fbbf24', color: '#000' }} onClick={handleVerifyOtp} disabled={loading}>{loading ? "..." : t.verifyBtn}</button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── LOGIN FLOW ── */}
          {mode === "login" && (
            <>
              {!otpSent && (
                <div className="lp-method-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button type="button" onClick={() => setAuthMethod('email')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--dl-border)', background: authMethod === 'email' ? 'var(--dl-indigo)' : 'transparent', color: authMethod === 'email' ? 'white' : 'var(--dl-text-muted)', cursor: 'pointer' }}>📧 Email</button>
                  <button type="button" onClick={() => setAuthMethod('mobile')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--dl-border)', background: authMethod === 'mobile' ? 'var(--dl-indigo)' : 'transparent', color: authMethod === 'mobile' ? 'white' : 'var(--dl-text-muted)', cursor: 'pointer' }}>📱 Mobile</button>
                </div>
              )}

              {authMethod === 'email' ? (
                <div className="lp-field">
                  <label>{t.email}</label>
                  <input type="email" placeholder="example@gmail.com" value={form.email} onChange={e => set("email", e.target.value)} disabled={otpSent} />
                </div>
              ) : (
                <div className="lp-field">
                  <label>{t.phone}</label>
                  <input type="tel" placeholder="9373082323" value={form.phone} onChange={e => set("phone", e.target.value)} disabled={otpSent} />
                </div>
              )}

              {!otpSent ? (
                <button className="lp-submit" onClick={handleSendOtp} disabled={loading}>{loading ? "..." : t.sendBtn}</button>
              ) : (
                <div className="lp-otp-section animate-in" style={{ marginTop: '10px' }}>
                  <div className="lp-field">
                    <label style={{ color: 'var(--dl-emerald)' }}>✔️ {t.otpLabel}</label>
                    <input type="tel" placeholder="------" maxLength={6} value={form.otp} onChange={e => set("otp", e.target.value)} autoFocus
                      style={{ fontSize: '2rem', textAlign: 'center', letterSpacing: '10px', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--dl-emerald)' }} />
                  </div>
                  <button className="lp-submit" style={{ background: 'var(--dl-emerald)' }} onClick={handleVerifyOtp} disabled={loading}>{loading ? "..." : t.verifyBtn}</button>
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '10px', color: 'var(--dl-text-muted)', cursor: 'pointer' }} onClick={() => setOtpSent(false)}>
                    {lang === 'mr' ? 'माहिती बदला' : 'Change Info'}
                  </p>
                </div>
              )}
            </>
          )}

          {error && <div className="lp-error" style={{ marginTop: '20px' }}>⚠️ {error}</div>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;