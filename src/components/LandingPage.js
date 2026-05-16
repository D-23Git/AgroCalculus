import React, { useState, useEffect, useCallback, useRef } from "react";
import "./LandingPage.css";

const API_KEY = "174f9f802dcca5936d82f0d168fea664";

const getWeatherIcon = (type) => {
  if (!type) return "☀️";
  if (type.includes("Rain"))    return "🌧️";
  if (type.includes("Cloud"))   return "⛅";
  if (type.includes("Clear"))   return "☀️";
  if (type.includes("Thunder")) return "⛈️";
  return "🌤️";
};

const TIPS = {
  en: ["🌱 Neem spray prevents aphids every 10 days.","💧 Drip irrigation saves 40% water.","🌾 PM Kisan due July — verify Aadhaar.","🐛 Yellow traps best for whitefly.","☀️ KUSUM solar pump — 90% subsidy!"],
  mr: ["🌱 कडुनिंब फवारणी दर १० दिवसांनी.","💧 ठिबक सिंचन — ४०% पाणी बचत.","🌾 PM किसान जुलैमध्ये — आधार तपासा.","🐛 पिवळे सापळे पांढऱ्या माशीसाठी.","☀️ KUSUM सौर पंप — ९०% सूट!"],
};

const NOTIFS_BASE = {
  en: [
    { t:"alert", m:"🚨 Heavy rain tomorrow — protect crops!", time:"Now" },
    { t:"info",  m:"💰 PM Kisan ₹2000 credited.",             time:"2h"  },
    { t:"tip",   m:"🌿 Apply fertilizer early morning.",       time:"5h"  },
  ],
  mr: [
    { t:"alert", m:"🚨 उद्या जोरदार पाऊस — पिके झाका!",    time:"आता"   },
    { t:"info",  m:"💰 PM किसान ₹२००० जमा.",                 time:"२ तास" },
    { t:"tip",   m:"🌿 खत घालण्यासाठी पहाटे.",              time:"५ तास" },
  ],
};

const TICKERS = {
  en: [
    { label:"🌾 Wheat ₹2,275 ▲ +1.2%",  name:"Wheat",   price:"₹2,275/qt", change:"+1.2%", up:true,  info:"Good demand from flour mills. Best time to sell." },
    { label:"🫘 Soybean ₹4,600 ▼ -0.8%", name:"Soybean", price:"₹4,600/qt", change:"-0.8%", up:false, info:"Slight drop due to import. Hold if possible." },
    { label:"🌿 Cotton ₹6,800 ▲ +2.1%",  name:"Cotton",  price:"₹6,800/qt", change:"+2.1%", up:true,  info:"Textile demand rising. Good time to sell." },
    { label:"🧅 Onion ₹1,200 ▼ -3.4%",   name:"Onion",   price:"₹1,200/qt", change:"-3.4%", up:false, info:"Oversupply in market. Wait for price rise." },
    { label:"🍚 Rice ₹3,100 ▲ +0.5%",    name:"Rice",    price:"₹3,100/qt", change:"+0.5%", up:true,  info:"Stable prices. Export demand is steady." },
  ],
  mr: [
    { label:"🌾 गहू ₹२,२७५ ▲ +१.२%",     name:"गहू",     price:"₹२,२७५/क्विं", change:"+१.२%", up:true,  info:"आटा मिलकडून चांगली मागणी. आत्ता विकणे फायदेशीर." },
    { label:"🫘 सोयाबीन ₹४,६०० ▼ -०.८%", name:"सोयाबीन", price:"₹४,६००/क्विं", change:"-०.८%", up:false, info:"आयातीमुळे किंचित घट. शक्य असल्यास थांबा." },
    { label:"🌿 कापूस ₹६,८०० ▲ +२.१%",   name:"कापूस",   price:"₹६,८००/क्विं", change:"+२.१%", up:true,  info:"कापड उद्योगाची मागणी वाढत आहे. आत्ता विका." },
    { label:"🧅 कांदा ₹१,२०० ▼ -३.४%",   name:"कांदा",   price:"₹१,२००/क्विं", change:"-३.४%", up:false, info:"बाजारात जास्त माल. भाव वाढेपर्यंत थांबा." },
    { label:"🍚 भात ₹३,१०० ▲ +०.५%",     name:"भात",     price:"₹३,१००/क्विं", change:"+०.५%", up:true,  info:"निर्यात मागणी स्थिर. भाव चांगले आहेत." },
  ],
};

const HOW = {
  en: [
    { step:"01", icon:"📲", title:"Quick Login",        desc:"Register in seconds and access your farming dashboard instantly."  },
    { step:"02", icon:"📊", title:"Track & Analyze",    desc:"Monitor expenses, income and crop data from one place."           },
    { step:"03", icon:"💹", title:"Live Market Prices", desc:"Get real-time mandi prices and expert selling advice."            },
    { step:"04", icon:"🤝", title:"Village Network",    desc:"Buy, sell and share updates with nearby farmers."                 },
  ],
  mr: [
    { step:"०१", icon:"📲", title:"जलद लॉगिन",       desc:"सेकंदात नोंदणी करून डॅशबोर्ड वापरा."                           },
    { step:"०२", icon:"📊", title:"नोंद व विश्लेषण", desc:"खर्च, उत्पन्न आणि पिकांचा मागोवा एकाच ठिकाणी ठेवा."          },
    { step:"०३", icon:"💹", title:"थेट मंडी भाव",     desc:"रिअल-टाइम भाव आणि विक्रीचा सल्ला मिळवा."                      },
    { step:"०४", icon:"🤝", title:"गाव नेटवर्क",      desc:"जवळच्या शेतकऱ्यांशी खरेदी-विक्री आणि माहिती शेअर करा."       },
  ],
};

const CONTACTS = {
  en: [
    { ico:"📞", name:"Kisan Helpline",  num:"1800-180-1551", clr:"#f0a500" },
    { ico:"💰", name:"PM Kisan",        num:"155261",         clr:"#ffd166" },
    { ico:"🏪", name:"Agro Shop Akola", num:"0724-2451201",  clr:"#c45c26" },
    { ico:"📊", name:"Mandi Prices",    num:"1800-270-0224", clr:"#5bbfb5" },
  ],
  mr: [
    { ico:"📞", name:"किसान हेल्पलाइन",  num:"1800-180-1551", clr:"#f0a500" },
    { ico:"💰", name:"PM किसान",          num:"155261",         clr:"#ffd166" },
    { ico:"🏪", name:"अॅग्रो शॉप अकोला", num:"0724-2451201",  clr:"#c45c26" },
    { ico:"📊", name:"मंडी भाव",          num:"1800-270-0224", clr:"#5bbfb5" },
  ],
};

const TX = {
  en: {
    tagline:"Smart Farming · 2026", sub:"Your Digital Farming Partner", desc:"TRACK · MONITOR · CONNECT",
    c1:"Digital Ledger", c1sub:"Track farm expenses",
    c2:"Market Watch",   c2sub:"Live mandi prices",
    c3:"Govt Schemes",   c3sub:"PM Kisan · KUSUM",
    notif:"Notifications", prof:"My Profile",
    ph:"Phone", farm:"Farm Size", loc:"Village", status:"Status", logout:"Sign Out",
    village:"Village Connect",
    weather:"Weather", tips:"Farm Tip",
    priceClose:"Close", advice:"Advice", tapInfo:"tap for info",
    howTitle:"How It Works", contactTitle:"Helplines & Contacts",
  },
  mr: {
    tagline:"स्मार्ट शेती · २०२६", sub:"तुमचा डिजिटल शेती सोबती", desc:"मागोवा · निरीक्षण · जोडा",
    c1:"डिजिटल खाते", c1sub:"शेती खर्च नोंदवा",
    c2:"बाजार भाव",   c2sub:"थेट मंडी भाव",
    c3:"सरकारी योजना", c3sub:"PM किसान · KUSUM",
    notif:"सूचना", prof:"माझे प्रोफाइल",
    ph:"फोन", farm:"शेत क्षेत्र", loc:"गाव", status:"स्थिती", logout:"बाहेर पडा",
    village:"गाव कनेक्ट",
    weather:"हवामान", tips:"टिप",
    priceClose:"बंद करा", advice:"सल्ला", tapInfo:"माहितीसाठी tap करा",
    howTitle:"कसे काम करते", contactTitle:"हेल्पलाइन व संपर्क",
  },
};

/* ── useInView ── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── MAIN COMPONENT ─── */
const LandingPage = ({ profile, onNavigate, onLogout, lang, setLang }) => {
  const [tipIdx,      setTipIdx]      = useState(0);
  const [tickIdx,     setTickIdx]     = useState(0);
  const [showN,       setShowN]       = useState(false);
  const [showP,       setShowP]       = useState(false);
  const [unread,      setUnread]      = useState(2);
  const [weatherData, setWeatherData] = useState(null);
  const [hourly,      setHourly]      = useState([]);
  const [liveNotifs,  setLiveNotifs]  = useState(NOTIFS_BASE[lang]);
  const [popup,       setPopup]       = useState(null);
  const [heroVis,     setHeroVis]     = useState(false);

  const [cardsRef, cardsVis] = useInView(0.08);
  const [wtRef,    wtVis]    = useInView();
  const [vcRef,    vcVis]    = useInView();
  const [howRef,   howVis]   = useInView();
  const [ctRef,    ctVis]    = useInView();

  const t       = TX[lang];
  const tickers = TICKERS[lang];
  const how     = HOW[lang];
  const contacts = CONTACTS[lang];

  useEffect(() => { const id = setTimeout(() => setHeroVis(true), 80); return () => clearTimeout(id); }, []);

  useEffect(() => {
    const a = setInterval(() => setTipIdx(i  => (i+1) % TIPS[lang].length), 4000);
    const b = setInterval(() => setTickIdx(i => (i+1) % tickers.length),    2500);
    return () => { clearInterval(a); clearInterval(b); };
  }, [lang, tickers.length]);

  useEffect(() => {
    const iv = setInterval(() => {
      setLiveNotifs(p => [{ t:"info", m:"🌱 New mandi price updated!", time:"now" }, ...p]);
      setUnread(u => u+1);
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lon } }) => {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
          .then(r => r.json()).then(setWeatherData).catch(() => {});
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
          .then(r => r.json()).then(d => setHourly((d.list||[]).slice(0,5))).catch(() => {});
      }, () => {}
    );
  }, []);

  useEffect(() => {
    if (weatherData?.weather?.[0]?.main?.includes("Rain"))
      setLiveNotifs(p => [{ t:"alert", m:"🚨 Rain expected — protect crops!", time:"now" }, ...p]);
  }, [weatherData]);

  useEffect(() => {
    setLiveNotifs(NOTIFS_BASE[lang]);
    setTipIdx(0); setTickIdx(0); setPopup(null);
  }, [lang]);

  const closeAll = useCallback(() => { setShowN(false); setShowP(false); }, []);

  /* card data — centralized */
  const CARDS = [
    {
      cls:  "ac-ledger",
      ico:  "📒",
      nav:  "ledger",
      lbl:  t.c1,
      sub:  t.c1sub,
      tag:  lang === "en" ? "Finance" : "वित्त",
    },
    {
      cls:  "ac-market",
      ico:  "📈",
      nav:  "market",
      lbl:  t.c2,
      sub:  t.c2sub,
      tag:  lang === "en" ? "Prices" : "भाव",
    },
    {
      cls:  "ac-scheme",
      ico:  "🏛️",
      nav:  "schemes",
      lbl:  t.c3,
      sub:  t.c3sub,
      tag:  lang === "en" ? "Govt" : "योजना",
    },
  ];

  const isAdmin = profile?.role === 'superadmin' || profile?.email === 'badhednyaneshwari23@gmail.com';

  return (
    <div className="pg">

      {/* ── TOPBAR ── */}
      <header className="tb">
        <div className="tb-brand">
          <span className="tb-emblem">🌾</span>
          <span className="tb-name">Agro<em>Calculus</em></span>
        </div>
        <div className="tb-right">
          {isAdmin && (
             <button className="tb-admin-pill" onClick={() => onNavigate('analytics')}>
                🛡️ Admin Dashboard
             </button>
          )}
          <button className="tb-ico-btn" onClick={() => { setShowN(v=>!v); setShowP(false); setUnread(0); }}>
            🔔{unread > 0 && <span className="tb-dot">{unread}</span>}
          </button>
          <button className="tb-ico-btn" onClick={() => { setShowP(v=>!v); setShowN(false); }}>
            👤
          </button>
          <div className="tb-lang">
            <button className={lang==="en"?"on":""} onClick={() => setLang("en")}>EN</button>
            <button className={lang==="mr"?"on":""} onClick={() => setLang("mr")}>म</button>
          </div>
        </div>
      </header>

      {(showN||showP) && <div className="dimmer" onClick={closeAll} />}

      {/* NOTIF PANEL */}
      {showN && (
        <div className="drop-box slide-in">
          <p className="drop-ttl">🔔 {t.notif}</p>
          {liveNotifs.slice(0,5).map((n,i) => (
            <div key={i} className={`nr nr-${n.t}`}>
              <span className="nr-m">{n.m}</span>
              <span className="nr-t">{n.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* PROFILE PANEL */}
      {showP && (
        <div className="drop-box">
          <p className="drop-ttl">👤 {t.prof}</p>
          <div className="pf-top">
            <div className="pf-av">{isAdmin ? '👑' : '🧑‍🌾'}</div>
            <div>
              <div className="pf-name">{isAdmin ? 'Admin' : (profile?.name || "—")}</div>
              <div className="pf-loc">📍 {isAdmin ? 'Control Center' : (profile?.village || "—")}</div>
            </div>
          </div>
          <div className="pf-grid">
            <div className="pf-c"><span>{t.ph}</span><b>{isAdmin ? 'Encrypted' : (profile?.phone || "—")}</b></div>
            <div className="pf-c"><span>{t.farm}</span><b>{isAdmin ? 'Global' : (profile?.acres ? `${profile.acres} ac` : "—")}</b></div>
            <div className="pf-c"><span>{t.loc}</span><b>{isAdmin ? 'Admin' : (profile?.village || "—")}</b></div>
            <div className="pf-c"><span>{t.status}</span><b className="ok">✅ {isAdmin ? 'Master Access' : 'Active'}</b></div>
          </div>
          <button className="logout-btn" onClick={onLogout}>🚪 {t.logout}</button>
        </div>
      )}

      {/* PRICE POPUP */}
      {popup && (
        <div className="pop-dim" onClick={() => setPopup(null)}>
          <div className="pop-box" onClick={e => e.stopPropagation()}>
            <div className="pop-top">
              <span className="pop-name">{popup.name}</span>
              <span className={`pop-ch ${popup.up ? "up" : "dn"}`}>{popup.change}</span>
            </div>
            <div className="pop-price">{popup.price}</div>
            <div className="pop-adv">💡 {t.advice}: {popup.info}</div>
            <button className="pop-close" onClick={() => setPopup(null)}>{t.priceClose}</button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className={`hero ${heroVis ? "hero--visible" : ""}`}>
        <div className="hero-orb hero-orb--1" />
        <div className="hero-orb hero-orb--2" />
        <div className="hero-orb hero-orb--3" />
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            {t.tagline}
          </div>
          <h1 className="hero-h1">
            <span className="hero-word hero-word--1">Agro</span>
            <span className="hero-word hero-word--2">Calculus</span>
          </h1>
          <p className="hero-sub">{t.sub}</p>
          <p className="hero-desc">{t.desc}</p>
          {profile?.name && (
            <div className="hero-greet">
              👋 {isAdmin ? (lang === 'en' ? 'Welcome, Super Admin' : 'स्वागत आहे, सुपर अॅडमिन') : (lang === 'en' ? `Welcome back, ${profile.name}` : `स्वागत, ${profile.name}`)}
            </div>
          )}
          <div className="hero-stats">
            <div className="hstat"><b>12K+</b><span>{lang==="en"?"Farmers":"शेतकरी"}</span></div>
            <div className="hstat-div" />
            <div className="hstat"><b>48</b><span>{lang==="en"?"Districts":"जिल्हे"}</span></div>
            <div className="hstat-div" />
            <div className="hstat"><b>₹2Cr+</b><span>{lang==="en"?"Saved":"बचत"}</span></div>
          </div>
        </div>
        <div className="hero-scroll"><div className="hero-scroll-line" /></div>
      </section>

      {/* ── LIVE TICKER ── */}
      <button className="ticker" onClick={() => setPopup(tickers[tickIdx])}>
        <span className="tk-live">LIVE</span>
        <span className="tk-txt" key={tickIdx}>{tickers[tickIdx].label}</span>
        <span className="tk-tap">{t.tapInfo} →</span>
      </button>

      {/* ── 3 CARDS — new layout ── */}
      <section ref={cardsRef} className={`cards ${cardsVis?"cards--visible":""}`}>
        {CARDS.map((card, i) => (
          <div
            key={i}
            className={`acard ${card.cls}`}
            style={{"--i": i}}
            onClick={() => onNavigate(card.nav)}
          >
            <div className="acard-shine" />
            <div className="ac-tag">{card.tag}</div>
            <div className="ac-content">
              <span className="ac-ico">{card.ico}</span>
              <div className="ac-lbl">{card.lbl}</div>
              <div className="ac-sub">{card.sub}</div>
              <div className="ac-cta">
                <span>{lang==="en"?"Open":"उघडा"}</span>
                <span className="ac-cta-arr">→</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div ref={wtRef} className={`wt-row ${wtVis?"reveal":""}`}>
        <div className="wt-box">
          <p className="box-lbl">{t.weather}</p>
          <div className="wt-main">
            <span className="wt-ico">
              {weatherData?.weather ? getWeatherIcon(weatherData.weather[0].main) : "☀️"}
            </span>
            <div>
              {weatherData?.main ? (
                <>
                  <div className="wt-tmp">{Math.round(weatherData.main.temp)}°C</div>
                  <div className="wt-sub2">{weatherData.weather[0].main} · {weatherData.name}</div>
                </>
              ) : (
                <div className="wt-tmp">--°C</div>
              )}
            </div>
          </div>
          {hourly.length > 0 && (
            <div className="hourly-row">
              {hourly.map((h,i) => (
                <div key={i} className="hourly-item">
                  <div className="h-time">{new Date(h.dt_txt).getHours()}:00</div>
                  <div className="h-ico">{getWeatherIcon(h.weather[0].main)}</div>
                  <div className="h-temp">{Math.round(h.main.temp)}°</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="tip-box">
          <p className="box-lbl">{t.tips}</p>
          <p className="tip-txt" key={tipIdx}>{TIPS[lang][tipIdx]}</p>
          <div className="tip-dots">
            {TIPS[lang].map((_,i) => (
              <span key={i} className={`td${i===tipIdx?" on":""}`} onClick={() => setTipIdx(i)} />
            ))}
          </div>
        </div>
      </div>

      <div ref={vcRef} className={`vc-entry-card ${vcVis?"reveal":""}`} onClick={() => onNavigate("village")}>
        <div className="vc-entry-left">
          <div className="vc-ico-wrap">🏘️</div>
          <div>
            <div className="vc-entry-title">{t.village}</div>
            <div className="vc-entry-sub">
              {lang==="en"?"Community · Buy/Sell · Helplines":"समुदाय · खरेदी/विक्री · हेल्पलाइन"}
            </div>
          </div>
        </div>
        <div className="vc-arrow-btn">→</div>
      </div>

      <div ref={howRef} className={`how-section ${howVis?"reveal":""}`}>
        <p className="section-lbl">{t.howTitle}</p>
        <div className="how-grid">
          {how.map((h,i) => (
            <div className="how-card" key={i} style={{"--i":i}}>
              <div className="how-num">{h.step}</div>
              <div className="how-ico">{h.icon}</div>
              <div className="how-title">{h.title}</div>
              <div className="how-desc">{h.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div ref={ctRef} className={`contact-section ${ctVis?"reveal":""}`}>
        <p className="section-lbl">{t.contactTitle}</p>
        <div className="contact-grid">
          {contacts.map((c,i) => (
            <a key={i} href={`tel:${c.num}`} className="contact-card" style={{"--cc":c.clr}}>
              <div className="cc-ico-wrap" style={{background:`${c.clr}18`,border:`1px solid ${c.clr}30`}}>
                {c.ico}
              </div>
              <div className="cc-info">
                <b>{c.name}</b>
                <span style={{color:c.clr}}>{c.num}</span>
              </div>
              <span className="cc-arr">→</span>
            </a>
          ))}
        </div>
      </div>

      <div className="vc-entry-card advisory-entry" onClick={() => onNavigate("advisory")}>
        <div className="vc-entry-left">
          <div className="vc-ico-wrap" style={{background:'linear-gradient(135deg, #7c3aed22, #a78bfa22)'}}>🤖</div>
          <div>
            <div className="vc-entry-title" style={{color:'#a78bfa'}}>
              {lang==="en"?"AI Smart Advisory":"AI स्मार्ट सल्ला"}
            </div>
            <div className="vc-entry-sub">
              {lang==="en"?"Crop Guide · Fertilizer · Weather · Supply Chain":"पीक मार्गदर्शन · खत · हवामान · सप्लाय चेन"}
            </div>
          </div>
        </div>
        <div className="vc-arrow-btn" style={{background:'rgba(167,139,250,0.12)',color:'#a78bfa'}}>→</div>
      </div>

      <footer className="footer">
        <div className="footer-brand">🌾 महाराष्ट्र कृषी पोर्टल</div>
        <p>© 2026 · {lang==="en"?"Made with ❤️ for Indian Farmers":"भारतीय शेतकऱ्यांसाठी ❤️ सह बनवले"}</p>
      </footer>
    </div>
  );
};
export default LandingPage;