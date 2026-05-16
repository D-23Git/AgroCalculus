import React, { useState, useMemo } from "react";
import "./Loginpage.css";
import api from "../utils/apiService";
import { DISTRICTS, ALL_DISTRICTS } from './MarketData';

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [authMethod, setAuthMethod] = useState("email"); // email | mobile
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
  const [offPin, setOffPin] = useState('');

  // Compute talukas when district selected
  const offTalukas = useMemo(() => {
    if (!offDist || !DISTRICTS[offDist]) return [];
    return Object.entries(DISTRICTS[offDist].talukas).map(([key, val]) => ({ key, name: val.name }));
  }, [offDist]);

  // Compute markets when taluka selected
  const offMarkets = useMemo(() => {
    if (!offDist || !offTal || !DISTRICTS[offDist]?.talukas[offTal]) return [];
    return DISTRICTS[offDist].talukas[offTal].markets || [];
  }, [offDist, offTal]);

  // Auto-compute PIN from mandiId (same hash as backend)
  const getMarketPIN = (marketId) => {
    if (!marketId) return '';
    let hash = 0;
    for (let i = 0; i < marketId.length; i++) {
      hash = ((hash << 5) - hash) + marketId.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 10000).toString().padStart(4, '0');
  };

  const selectedMarketId = offMarket;
  const autoPin = getMarketPIN(selectedMarketId);

  const T = {
    en: {
      welcome: "Welcome to AgroMaster", tagline: "Your Digital Farming Partner",
      login: "Login", register: "Sign Up",
      name: "Full Name", phone: "Mobile Number", email: "Email Address",
      village: "Village", acres: "Acres",
      sendBtn: "Send OTP →", verifyBtn: "Verify & Start →",
      otpLabel: "Enter 6-digit OTP",
      err_phone: "Please enter a valid 10-digit number",
      err_email: "Please enter a valid email address",
      err_otp: "OTP is incorrect",
      otpSentMsg: "OTP sent! Check your inbox."
    },
    mr: {
      welcome: "ॲग्रो-मास्टर मध्ये स्वागत", tagline: "तुमचा डिजिटल शेती सोबती",
      login: "लॉगिन", register: "नोंदणी",
      name: "पूर्ण नाव", phone: "मोबाईल नंबर", email: "ईमेल आयडी",
      village: "गाव / तालुका", acres: "शेत आकार (एकर)",
      sendBtn: "ओटीपी पाठवा →", verifyBtn: "ओटीपी तपासा आणि सुरू करा →",
      otpLabel: "६ अंकी ओटीपी टाका",
      err_phone: "कृपया १० अंकी नंबर टाका",
      err_email: "कृपया योग्य ईमेल टाका",
      err_otp: "ओटीपी चुकीचा आहे",
      otpSentMsg: "ओटीपी पाठवला आहे! तुमचा इमेल तपासा."
    }
  };
  const t = T[lang];
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSendOtp = async () => {
    setError("");
    if (authMethod === 'mobile' && !/^\d{10}$/.test(form.phone)) return setError(t.err_phone);
    if (authMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError(t.err_email);
    
    setLoading(true);
    const res = await api.sendOtp(authMethod === 'email' ? { email: form.email } : { mobile: form.phone });
    setLoading(false);

    if (res.error) {
      setError(res.error === "Server unreachable" ? (lang==='mr'?'सर्वरशी संपर्क होत नाहीये':'Server unreachable') : res.msg || res.error);
    } else {
      setOtpSent(true);
      alert(t.otpSentMsg + (authMethod==='email' ? ' (Check Inbox/Spam)' : ' (Check Terminal)'));
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!form.otp || form.otp.length < 6) return setError(t.err_otp);

    setLoading(true);
    const res = await api.verifyOtp(
        authMethod === 'email' ? { email: form.email } : { mobile: form.phone }, 
        form.otp, 
        mode === "register" ? form.name : null
    );
    setLoading(false);

    if (res.error) return setError(res.msg || res.error);
    
    const profile = { ...res.user, village: form.village || "—", acres: form.acres || "—" };
    localStorage.setItem("agro_token", res.token);
    localStorage.setItem("agro_profile", JSON.stringify(profile));
    onLogin(profile);
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

        <div className="lp-tabs">
          <button className={mode === "login" ? "on" : ""} onClick={() => { setMode("login"); setOtpSent(false); setError(""); }}>{t.login}</button>
          <button className={mode === "register" ? "on" : ""} onClick={() => { setMode("register"); setOtpSent(false); setError(""); }}>{t.register}</button>
          <button className={mode === "officer" ? "on" : ""} onClick={() => { setMode("officer"); setOtpSent(false); setError(""); }}>{lang === 'mr' ? "प्रशासक" : "Officer"}</button>
        </div>

        <div className="lp-form">
          {mode !== 'officer' && !otpSent && (
            <div className="lp-method-toggle" style={{display:'flex', gap:'10px', marginBottom:'20px', position:'relative', zIndex:10}}>
              <button type="button" onClick={()=>setAuthMethod('email')} style={{flex:1, padding:'10px', borderRadius:'8px', border:'1px solid var(--dl-border)', background: authMethod==='email'?'var(--dl-indigo)':'transparent', color: authMethod==='email'?'white':'var(--dl-text-muted)', cursor:'pointer'}}>📧 Email</button>
              <button type="button" onClick={()=>setAuthMethod('mobile')} style={{flex:1, padding:'10px', borderRadius:'8px', border:'1px solid var(--dl-border)', background: authMethod==='mobile'?'var(--dl-indigo)':'transparent', color: authMethod==='mobile'?'white':'var(--dl-text-muted)', cursor:'pointer'}}>📱 Mobile</button>
            </div>
          )}

          {mode === "register" && (
            <div className="lp-field">
              <label>{t.name}</label>
              <input type="text" placeholder="darshan badhe" value={form.name} onChange={e => set("name", e.target.value)} disabled={otpSent} />
            </div>
          )}

          {mode !== 'officer' ? (
            authMethod === 'email' ? (
              <div className="lp-field">
                <label>{t.email}</label>
                <input type="email" placeholder="example@gmail.com" value={form.email} onChange={e => set("email", e.target.value)} disabled={otpSent} />
              </div>
            ) : (
              <div className="lp-field">
                <label>{t.phone}</label>
                <input type="tel" placeholder="9373082323" value={form.phone} onChange={e => set("phone", e.target.value)} disabled={otpSent} />
              </div>
            )
          ) : (
            <>
              {/* STAFF ID - prefilled */}
              <div className="lp-field">
                <label>{lang === 'mr' ? "स्टाफ आयडी" : "Staff ID"}</label>
                <input type="text" value={offStaffId} onChange={e => setOffStaffId(e.target.value)}
                  style={{background:'rgba(99,102,241,0.1)', borderColor:'rgba(99,102,241,0.5)', color:'white'}} />
              </div>

              {/* DISTRICT DROPDOWN */}
              <div className="lp-field">
                <label>{lang === 'mr' ? "जिल्हा निवडा" : "Select District"}</label>
                <select value={offDist} onChange={e => { setOffDist(e.target.value); setOffTal(''); setOffMarket(''); }}
                  style={{width:'100%', padding:'12px', borderRadius:'10px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'white', fontSize:'0.95rem'}}>
                  <option value="">{lang === 'mr' ? '-- जिल्हा निवडा --' : '-- Select District --'}</option>
                  {ALL_DISTRICTS.map(d => (
                    <option key={d.id} value={d.id} style={{background:'#1e1e2e'}}>
                      {d.icon} {lang === 'mr' ? d.mr : d.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* TALUKA DROPDOWN */}
              {offDist && (
                <div className="lp-field">
                  <label>{lang === 'mr' ? "तालुका निवडा" : "Select Taluka"}</label>
                  <select value={offTal} onChange={e => { setOffTal(e.target.value); setOffMarket(''); }}
                    style={{width:'100%', padding:'12px', borderRadius:'10px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'white', fontSize:'0.95rem'}}>
                    <option value="">{lang === 'mr' ? '-- तालुका निवडा --' : '-- Select Taluka --'}</option>
                    {offTalukas.map(t => (
                      <option key={t.key} value={t.key} style={{background:'#1e1e2e'}}>
                        {lang === 'mr' ? t.name.mr : t.name.en}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* MARKET DROPDOWN */}
              {offTal && (
                <div className="lp-field">
                  <label>{lang === 'mr' ? "मार्केट / मंडी निवडा" : "Select Market / Mandi"}</label>
                  <select value={offMarket} onChange={e => setOffMarket(e.target.value)}
                    style={{width:'100%', padding:'12px', borderRadius:'10px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'white', fontSize:'0.95rem'}}>
                    <option value="">{lang === 'mr' ? '-- मंडी निवडा --' : '-- Select Mandi --'}</option>
                    {offMarkets.map(m => (
                      <option key={m.id} value={m.id} style={{background:'#1e1e2e'}}>
                        {lang === 'mr' ? m.name.mr : m.name.en}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* AUTO PIN DISPLAY */}
              {offMarket && (
                <div className="lp-field">
                  <label>{lang === 'mr' ? "पिन (PIN) — आपोआप भरला जातो" : "PIN (Auto-generated)"}</label>
                  <div style={{
                    background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.4)',
                    borderRadius:'10px', padding:'12px 16px', letterSpacing:'8px', fontSize:'1.4rem',
                    textAlign:'center', color:'#34d399', fontWeight:700
                  }}>{autoPin}</div>
                  <p style={{fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', marginTop:'4px', textAlign:'center'}}>
                    {lang === 'mr' ? 'हा पिन तुमच्या मंडईसाठी आपोआप तयार होतो' : 'This PIN is auto-generated for your Mandi'}
                  </p>
                </div>
              )}
            </>/>
          )}

          {mode === "register" && (
            <div className="lp-row">
              <div className="lp-field"><label>{t.village}</label><input type="text" placeholder="waghale" value={form.village} onChange={e => set("village", e.target.value)} disabled={otpSent} /></div>
              <div className="lp-field"><label>{t.acres}</label><input type="number" placeholder="4" value={form.acres} onChange={e => set("acres", e.target.value)} disabled={otpSent} /></div>
            </div>
          )}

          {mode === 'officer' ? (
            <button className="lp-submit" onClick={async () => {
                if (!offMarket) { setError(lang === 'mr' ? 'कृपया मंडी निवडा' : 'Please select a Mandi'); return; }
                setLoading(true);
                setError("");
                try {
                    const res = await api.staffLogin({ staffId: offStaffId, pin: autoPin, mandiId: offMarket });
                    if (res.error) {
                        setError(res.error);
                    } else {
                        onLogin({ role: 'staff', mandiId: offMarket, token: 'staff_dummy_token', name: offStaffId });
                    }
                } catch(e) {
                    setError("Server error");
                }
                setLoading(false);
            }} disabled={loading || !offMarket}>
              {loading ? "..." : (lang === 'mr' ? "मंडईत प्रवेश करा 🏪" : "Enter Mandi 🏪")}
            </button>
          ) : (!otpSent ? (
            <button className="lp-submit" onClick={handleSendOtp} disabled={loading}>
              {loading ? "..." : t.sendBtn}
            </button>
          ) : (
            <div className="lp-otp-section animate-in" style={{marginTop:'10px'}}>
              <div className="lp-field">
                <label style={{color:'var(--dl-emerald)'}}>✔️ {t.otpLabel}</label>
                <input type="tel" placeholder="------" maxLength={6} value={form.otp} onChange={e => set("otp", e.target.value)} autoFocus
                  style={{fontSize:'2rem', textAlign:'center', letterSpacing:'10px', background:'rgba(16, 185, 129, 0.1)', borderColor:'var(--dl-emerald)'}} />
              </div>
              <button className="lp-submit" style={{background:'var(--dl-emerald)'}} onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "..." : t.verifyBtn}
              </button>
              <p style={{textAlign:'center', fontSize:'0.8rem', marginTop:'10px', color:'var(--dl-text-muted)', cursor:'pointer'}} onClick={()=>setOtpSent(false)}>
                {lang==='mr'?'माहिती बदला':'Change Info'}
              </p>
            </div>
          ))}

          {error && <div className="lp-error" style={{marginTop:'20px'}}>⚠️ {error}</div>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;