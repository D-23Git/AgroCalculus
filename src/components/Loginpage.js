import React, { useState } from "react";
import "./Loginpage.css";
import api from "../utils/apiService";

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [authMethod, setAuthMethod] = useState("email"); // email | mobile
  const [otpSent, setOtpSent] = useState(false);
  const [lang, setLang] = useState("mr");
  const [form, setForm] = useState({ name: "", phone: "", email: "", village: "", acres: "", otp: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
              <div className="lp-field">
                <label>{lang === 'mr' ? "स्टाफ आयडी" : "Staff ID"}</label>
                <input type="text" placeholder="EMP1234" value={form.staffId || ''} onChange={e => set("staffId", e.target.value)} />
              </div>
              <div className="lp-field">
                <label>{lang === 'mr' ? "मंडी आयडी (उदा. pune_haveli_main)" : "Mandi ID"}</label>
                <input type="text" placeholder="pune_haveli_main" value={form.mandiId || ''} onChange={e => set("mandiId", e.target.value)} />
              </div>
              <div className="lp-field">
                <label>{lang === 'mr' ? "पिन (PIN)" : "PIN"}</label>
                <input type="password" placeholder="****" value={form.pin || ''} onChange={e => set("pin", e.target.value)} />
              </div>
            </>
          )}

          {mode === "register" && (
            <div className="lp-row">
              <div className="lp-field"><label>{t.village}</label><input type="text" placeholder="waghale" value={form.village} onChange={e => set("village", e.target.value)} disabled={otpSent} /></div>
              <div className="lp-field"><label>{t.acres}</label><input type="number" placeholder="4" value={form.acres} onChange={e => set("acres", e.target.value)} disabled={otpSent} /></div>
            </div>
          )}

          {mode === 'officer' ? (
            <button className="lp-submit" onClick={async () => {
                setLoading(true);
                setError("");
                try {
                    const res = await api.staffLogin({ staffId: form.staffId, pin: form.pin, mandiId: form.mandiId });
                    if (res.error) {
                        setError(res.error);
                    } else {
                        // Redirect to market page with mandiId, indicating staff login
                        onLogin({ role: 'staff', mandiId: form.mandiId, token: 'staff_dummy_token' });
                    }
                } catch(e) {
                    setError("Server error");
                }
                setLoading(false);
            }} disabled={loading}>
              {loading ? "..." : (lang === 'mr' ? "लॉगिन करा" : "Login")}
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