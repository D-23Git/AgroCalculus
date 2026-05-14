import React, { useState, useCallback } from "react";
import "./AdvisoryPage.css";

/* ─── STATIC DATA ─── */
const DISTRICTS = {
  en: ["Akola","Amravati","Nagpur","Nashik","Pune","Solapur","Satara","Kolhapur","Aurangabad","Latur","Nanded","Wardha","Yavatmal","Buldhana"],
  mr: ["अकोला","अमरावती","नागपूर","नाशिक","पुणे","सोलापूर","सातारा","कोल्हापूर","औरंगाबाद","लातूर","नांदेड","वर्धा","यवतमाळ","बुलडाणा"],
};

const SOIL_TYPES = {
  en: ["Black (Kali Mati)","Red Laterite","Alluvial","Sandy","Clay"],
  mr: ["काळी माती","लाल माती","गाळाची माती","वालुकामय","चिकणमाती"],
};

const SEASONS = {
  en: ["Kharif (June–Oct)","Rabi (Oct–Feb)","Summer (Feb–May)"],
  mr: ["खरीप (जून–ऑक्टो)","रब्बी (ऑक्टो–फेब्रु)","उन्हाळी (फेब्रु–मे)"],
};

const WATER = {
  en: ["Rain-fed only","One irrigation","Two irrigations","Full irrigation"],
  mr: ["फक्त पाऊस","एक पाणी","दोन पाणी","पूर्ण सिंचन"],
};

const TX = {
  en: {
    title:"Smart Advisory", back:"← Back",
    tabAdvisory:"🧠 Crop Advisory", tabChain:"🔗 Supply Chain",
    /* Advisory */
    advisoryTitle:"AI Crop Advisory",
    advisorySubtitle:"Get personalized crop recommendation powered by AI",
    district:"District", soil:"Soil Type", season:"Season / Crop Period",
    area:"Farm Area (Acres)", water:"Water Availability",
    prevCrop:"Previous Crop (optional)",
    prevCropPh:"e.g. Soybean, Cotton...",
    getAdvice:"Get AI Recommendation →",
    analyzing:"Analyzing your farm data...",
    /* Supply Chain */
    chainTitle:"Supply Chain Tracker",
    chainSubtitle:"Track your produce from farm to market",
    addBatch:"+ New Batch",
    batchCrop:"Crop Name", batchQty:"Quantity (kg)", batchPrice:"Price (₹/kg)",
    batchBuyer:"Buyer Name", batchDest:"Destination (Mandi/Town)",
    batchDate:"Harvest Date",
    saveBatch:"Save Batch",
    trackId:"Tracking ID",
    status:"Status",
    statuses:["Harvested","In Transit","At Mandi","Sold"],
    updateStatus:"Update Status",
    totalBatches:"Total Batches",
    totalValue:"Total Value",
    sold:"Sold",
    cancel:"Cancel",
    cropPh:"e.g. Wheat",
    qtyPh:"e.g. 500",
    pricePh:"e.g. 28",
    buyerPh:"e.g. Ramesh Traders",
    destPh:"e.g. Akola Mandi",
  },
  mr: {
    title:"स्मार्ट सल्ला", back:"← परत",
    tabAdvisory:"🧠 पीक सल्ला", tabChain:"🔗 सप्लाय चेन",
    advisoryTitle:"AI पीक सल्ला प्रणाली",
    advisorySubtitle:"AI च्या मदतीने तुमच्या शेतासाठी योग्य पीक निवडा",
    district:"जिल्हा", soil:"माती प्रकार", season:"हंगाम",
    area:"शेत क्षेत्र (एकर)", water:"पाण्याची उपलब्धता",
    prevCrop:"मागील पीक (पर्यायी)",
    prevCropPh:"उदा. सोयाबीन, कापूस...",
    getAdvice:"AI सल्ला मिळवा →",
    analyzing:"तुमच्या शेताचे विश्लेषण सुरू आहे...",
    chainTitle:"सप्लाय चेन ट्रॅकर",
    chainSubtitle:"शेतापासून बाजारापर्यंत पिकाचा मागोवा घ्या",
    addBatch:"+ नवीन बॅच",
    batchCrop:"पीक", batchQty:"प्रमाण (किग्रॅ)", batchPrice:"भाव (₹/किग्रॅ)",
    batchBuyer:"खरेदीदार", batchDest:"गंतव्यस्थान (मंडी/शहर)",
    batchDate:"काढणी तारीख",
    saveBatch:"बॅच जतन करा",
    trackId:"ट्रॅकिंग ID",
    status:"स्थिती",
    statuses:["काढणी झाली","वाहतुकीत","मंडीत","विकला"],
    updateStatus:"स्थिती अपडेट करा",
    totalBatches:"एकूण बॅच",
    totalValue:"एकूण मूल्य",
    sold:"विकले",
    cancel:"रद्द करा",
    cropPh:"उदा. गहू",
    qtyPh:"उदा. ५००",
    pricePh:"उदा. २८",
    buyerPh:"उदा. रमेश ट्रेडर्स",
    destPh:"उदा. अकोला मंडी",
  },
};

const SAMPLE_BATCHES = [
  { id:"AGR-2026-001", crop:"Soybean",  qty:800,  price:46, buyer:"Ramesh Traders", dest:"Akola Mandi",   date:"2026-03-10", status:3 },
  { id:"AGR-2026-002", crop:"Wheat",    qty:500,  price:28, buyer:"Patil Brothers",  dest:"Nashik APMC",   date:"2026-03-14", status:2 },
  { id:"AGR-2026-003", crop:"Cotton",   qty:1200, price:68, buyer:"Suresh Ginning",  dest:"Amravati Mandi",date:"2026-03-18", status:1 },
];

const STATUS_COLORS = ["#fbbf24","#60a5fa","#a78bfa","#4ade80"];
const STATUS_ICONS  = ["🌾","🚛","🏪","✅"];

let _batchId = Date.now();

/* ─── COMPONENT ─── */
const AdvisoryPage = ({ lang = "en", onNavigate, profile }) => {
  const [tab,       setTab]       = useState("advisory");
  const t = TX[lang];

  /* ADVISORY STATE */
  const [form, setForm] = useState({
    district: DISTRICTS[lang][0],
    soil:     SOIL_TYPES[lang][0],
    season:   SEASONS[lang][0],
    area:     "",
    water:    WATER[lang][0],
    prevCrop: "",
  });
  const [loading,  setLoading]  = useState(false);
  const [advice,   setAdvice]   = useState(null);
  const [advErr,   setAdvErr]   = useState("");

  /* SUPPLY CHAIN STATE */
  const [batches, setBatches] = useState(() => {
    const saved = localStorage.getItem('agro_batches');
    return saved ? JSON.parse(saved) : SAMPLE_BATCHES;
  });
  const [showBForm,  setShowBForm]  = useState(false);
  const [bForm,      setBForm]      = useState({ crop:"", qty:"", price:"", buyer:"", dest:"", date: new Date().toISOString().slice(0,10) });
  const [bErr,       setBErr]       = useState("");

  const setF  = (k,v) => setForm(f   => ({ ...f, [k]: v }));
  const setBF = (k,v) => setBForm(f  => ({ ...f, [k]: v }));

  /* ── CALL CLAUDE API ── */
  const getAdvice = useCallback(async () => {
    if (!form.area || isNaN(parseFloat(form.area))) {
      setAdvErr(lang === "en" ? "Please enter farm area" : "शेत क्षेत्र टाका"); return;
    }
    setAdvErr(""); setLoading(true); setAdvice(null);

    const prompt = `You are an expert agricultural advisor for Maharashtra, India.
A farmer has provided the following details:
- District: ${form.district}
- Soil Type: ${form.soil}
- Season: ${form.season}
- Farm Area: ${form.area} acres
- Water Availability: ${form.water}
- Previous Crop: ${form.prevCrop || "Not specified"}

Please provide a comprehensive crop advisory in ${lang === "mr" ? "Marathi" : "English"} with the following sections. Use emojis and be practical. Format as JSON with these exact keys:
{
  "recommended_crop": "Top crop name",
  "reason": "2-3 sentence explanation why this crop suits the farm",
  "expected_yield": "Expected yield per acre",
  "expected_profit": "Expected profit per acre in ₹",
  "market_price": "Current approximate market price",
  "price_trend": "up/down/stable",
  "fertilizer_schedule": [
    {"week": "Week 1", "action": "action description"},
    {"week": "Week 3", "action": "action description"},
    {"week": "Week 6", "action": "action description"},
    {"week": "Week 10", "action": "action description"}
  ],
  "water_schedule": [
    {"stage": "Sowing", "frequency": "irrigation frequency"},
    {"stage": "Germination", "frequency": "irrigation frequency"},
    {"stage": "Flowering", "frequency": "irrigation frequency"},
    {"stage": "Harvest", "frequency": "irrigation frequency"}
  ],
  "weather_advice": "Weather-based tip for this district and season",
  "risk_warning": "One key risk to watch for",
  "alternative_crops": ["crop1", "crop2"],
  "harvest_days": "Days to harvest from sowing"
}
Return ONLY valid JSON, no extra text.`;

    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1500,
          messages:[{ role:"user", content:prompt }],
        }),
      });
      const data = await res.json();
      const raw  = data.content?.[0]?.text || "";
      const json = raw.replace(/```json|```/g,"").trim();
      setAdvice(JSON.parse(json));
    } catch (e) {
      setAdvErr(lang==="en" ? "Could not fetch advisory. Please try again." : "सल्ला मिळवता आला नाही. पुन्हा प्रयत्न करा.");
    } finally {
      setLoading(false);
    }
  }, [form, lang]);

  /* ── ADD BATCH ── */
  const addBatch = () => {
    setBErr("");
    if (!bForm.crop.trim()) return setBErr(lang==="en"?"Enter crop name":"पीकाचे नाव टाका");
    if (!bForm.qty || isNaN(bForm.qty)) return setBErr(lang==="en"?"Enter valid quantity":"प्रमाण टाका");
    if (!bForm.price || isNaN(bForm.price)) return setBErr(lang==="en"?"Enter valid price":"भाव टाका");
    const id = `AGR-${new Date().getFullYear()}-${Math.floor(Math.random()*900)+100}`;
    const newBatch = {
      id, crop:bForm.crop.trim(), qty:parseFloat(bForm.qty),
      price:parseFloat(bForm.price), buyer:bForm.buyer.trim()||"—",
      dest:bForm.dest.trim()||"—", date:bForm.date||new Date().toISOString().slice(0,10),
      status:0,
    };
    
    setBatches(p => {
      const updated = [newBatch, ...p];
      localStorage.setItem('agro_batches', JSON.stringify(updated));
      return updated;
    });
    setBForm({ crop:"", qty:"", price:"", buyer:"", dest:"", date: new Date().toISOString().slice(0,10) });
    setShowBForm(false);
  };

  const updateStatus = (id, dir) => {
    setBatches(p => {
      const updated = p.map(b => b.id===id
        ? { ...b, status: Math.min(Math.max(b.status + dir, 0), 3) }
        : b
      );
      localStorage.setItem('agro_batches', JSON.stringify(updated));
      return updated;
    });
  };

  /* ── STATS ── */
  const totalVal  = batches.reduce((s,b) => s + b.qty * b.price, 0);
  const soldCount = batches.filter(b => b.status === 3).length;

  return (
    <div className="adv-page">

      {/* HEADER */}
      <header className="adv-header">
        <div className="adv-header-left">
          {onNavigate && <button className="adv-back" onClick={() => onNavigate("home")}>{t.back}</button>}
          <span className="adv-title">🌿 {t.title}</span>
        </div>
      </header>

      {/* TABS */}
      <div className="adv-tabs">
        <button className={`adv-tab${tab==="advisory"?" on":""}`} onClick={()=>setTab("advisory")}>
          {t.tabAdvisory}
        </button>
        <button className={`adv-tab${tab==="chain"?" on":""}`} onClick={()=>setTab("chain")}>
          {t.tabChain}
        </button>
      </div>

      {/* ══════════════════════════════
          TAB: CROP ADVISORY
      ══════════════════════════════ */}
      {tab==="advisory" && (
        <div className="adv-content">
          <div className="adv-hero">
            <h2 className="adv-h2">{t.advisoryTitle}</h2>
            <p className="adv-sub">{t.advisorySubtitle}</p>
          </div>

          {/* INPUT FORM */}
          <div className="adv-form-card">

            <div className="adv-form-grid">
              {/* District */}
              <div className="adv-field">
                <label>{t.district}</label>
                <select value={form.district} onChange={e=>setF("district",e.target.value)}>
                  {DISTRICTS[lang].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              {/* Soil */}
              <div className="adv-field">
                <label>{t.soil}</label>
                <select value={form.soil} onChange={e=>setF("soil",e.target.value)}>
                  {SOIL_TYPES[lang].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Season */}
              <div className="adv-field">
                <label>{t.season}</label>
                <select value={form.season} onChange={e=>setF("season",e.target.value)}>
                  {SEASONS[lang].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Area */}
              <div className="adv-field">
                <label>{t.area}</label>
                <input type="number" placeholder="e.g. 3" value={form.area}
                  onChange={e=>setF("area",e.target.value)} />
              </div>

              {/* Water */}
              <div className="adv-field">
                <label>{t.water}</label>
                <select value={form.water} onChange={e=>setF("water",e.target.value)}>
                  {WATER[lang].map(w => <option key={w}>{w}</option>)}
                </select>
              </div>

              {/* Prev Crop */}
              <div className="adv-field">
                <label>{t.prevCrop}</label>
                <input type="text" placeholder={t.prevCropPh} value={form.prevCrop}
                  onChange={e=>setF("prevCrop",e.target.value)} />
              </div>
            </div>

            {advErr && <div className="adv-err">⚠️ {advErr}</div>}

            <button className="adv-submit-btn" onClick={getAdvice} disabled={loading}>
              {loading ? <><span className="adv-spinner"/>  {t.analyzing}</> : t.getAdvice}
            </button>
          </div>

          {/* RESULT */}
          {advice && (
            <div className="adv-result">

              {/* RECOMMENDED CROP HERO */}
              <div className="result-hero">
                <div className="result-hero-left">
                  <span className="result-crop-icon">🌾</span>
                  <div>
                    <div className="result-crop-name">{advice.recommended_crop}</div>
                    <div className="result-crop-reason">{advice.reason}</div>
                  </div>
                </div>
                <div className="result-hero-stats">
                  <div className="rhs-item">
                    <span className="rhs-lbl">{lang==="en"?"Yield/Acre":"उत्पन्न/एकर"}</span>
                    <span className="rhs-val">{advice.expected_yield}</span>
                  </div>
                  <div className="rhs-item">
                    <span className="rhs-lbl">{lang==="en"?"Profit/Acre":"नफा/एकर"}</span>
                    <span className="rhs-val green">{advice.expected_profit}</span>
                  </div>
                  <div className="rhs-item">
                    <span className="rhs-lbl">{lang==="en"?"Market Price":"बाजारभाव"}</span>
                    <span className={`rhs-val ${advice.price_trend==="up"?"green":advice.price_trend==="down"?"red":"gold"}`}>
                      {advice.market_price} {advice.price_trend==="up"?"▲":advice.price_trend==="down"?"▼":"→"}
                    </span>
                  </div>
                  <div className="rhs-item">
                    <span className="rhs-lbl">{lang==="en"?"Harvest In":"काढणी"}</span>
                    <span className="rhs-val">{advice.harvest_days}</span>
                  </div>
                </div>
              </div>

              {/* FERTILIZER SCHEDULE */}
              <div className="result-section">
                <p className="result-section-ttl">🧪 {lang==="en"?"Fertilizer Schedule":"खत वेळापत्रक"}</p>
                <div className="schedule-timeline">
                  {(advice.fertilizer_schedule || []).map((s,i) => (
                    <div className="timeline-item" key={i}>
                      <div className="tl-dot"/>
                      <div className="tl-body">
                        <span className="tl-week">{s.week}</span>
                        <span className="tl-action">{s.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WATER SCHEDULE */}
              <div className="result-section">
                <p className="result-section-ttl">💧 {lang==="en"?"Irrigation Schedule":"सिंचन वेळापत्रक"}</p>
                <div className="water-grid">
                  {(advice.water_schedule || []).map((w,i) => (
                    <div className="water-card" key={i}>
                      <span className="wc-stage">{w.stage}</span>
                      <span className="wc-freq">{w.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WEATHER + RISK */}
              <div className="result-row-2">
                <div className="result-info-card weather">
                  <p className="ric-ttl">🌤️ {lang==="en"?"Weather Advice":"हवामान सल्ला"}</p>
                  <p className="ric-txt">{advice.weather_advice}</p>
                </div>
                <div className="result-info-card risk">
                  <p className="ric-ttl">⚠️ {lang==="en"?"Risk Warning":"धोका"}</p>
                  <p className="ric-txt">{advice.risk_warning}</p>
                </div>
              </div>

              {/* ALTERNATIVES */}
              {advice.alternative_crops?.length > 0 && (
                <div className="result-section">
                  <p className="result-section-ttl">🔄 {lang==="en"?"Alternative Crops":"पर्यायी पिके"}</p>
                  <div className="alt-chips">
                    {advice.alternative_crops.map((c,i) => (
                      <span className="alt-chip" key={i}>🌱 {c}</span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════
          TAB: SUPPLY CHAIN
      ══════════════════════════════ */}
      {tab==="chain" && (
        <div className="adv-content">
          <div className="adv-hero">
            <h2 className="adv-h2">{t.chainTitle}</h2>
            <p className="adv-sub">{t.chainSubtitle}</p>
          </div>

          {/* STATS */}
          <div className="chain-stats">
            <div className="cstat">
              <span className="cstat-ico">📦</span>
              <span className="cstat-val">{batches.length}</span>
              <span className="cstat-lbl">{t.totalBatches}</span>
            </div>
            <div className="cstat">
              <span className="cstat-ico">💰</span>
              <span className="cstat-val">₹{(totalVal/1000).toFixed(0)}K</span>
              <span className="cstat-lbl">{t.totalValue}</span>
            </div>
            <div className="cstat">
              <span className="cstat-ico">✅</span>
              <span className="cstat-val">{soldCount}</span>
              <span className="cstat-lbl">{t.sold}</span>
            </div>
          </div>

          {/* ADD BATCH BUTTON */}
          <button className="chain-add-btn" onClick={()=>setShowBForm(true)}>
            {t.addBatch}
          </button>

          {/* ADD BATCH FORM */}
          {showBForm && (
            <div className="batch-form-card">
              <p className="bfc-ttl">{t.addBatch.replace("+ ","")}</p>
              <div className="bfc-grid">
                <div className="adv-field">
                  <label>{t.batchCrop}</label>
                  <input type="text" placeholder={t.cropPh} value={bForm.crop} onChange={e=>setBF("crop",e.target.value)} />
                </div>
                <div className="adv-field">
                  <label>{t.batchQty}</label>
                  <input type="number" placeholder={t.qtyPh} value={bForm.qty} onChange={e=>setBF("qty",e.target.value)} />
                </div>
                <div className="adv-field">
                  <label>{t.batchPrice}</label>
                  <input type="number" placeholder={t.pricePh} value={bForm.price} onChange={e=>setBF("price",e.target.value)} />
                </div>
                <div className="adv-field">
                  <label>{t.batchBuyer}</label>
                  <input type="text" placeholder={t.buyerPh} value={bForm.buyer} onChange={e=>setBF("buyer",e.target.value)} />
                </div>
                <div className="adv-field">
                  <label>{t.batchDest}</label>
                  <input type="text" placeholder={t.destPh} value={bForm.dest} onChange={e=>setBF("dest",e.target.value)} />
                </div>
                <div className="adv-field">
                  <label>{t.batchDate}</label>
                  <input type="date" value={bForm.date} onChange={e=>setBF("date",e.target.value)} />
                </div>
              </div>
              {bErr && <div className="adv-err">⚠️ {bErr}</div>}
              <div className="bfc-btns">
                <button className="bfc-cancel" onClick={()=>setShowBForm(false)}>{t.cancel}</button>
                <button className="bfc-save" onClick={addBatch}>{t.saveBatch}</button>
              </div>
            </div>
          )}

          {/* BATCH LIST */}
          <div className="batch-list">
            {batches.map(b => (
              <div className="batch-card" key={b.id}>

                {/* TOP ROW */}
                <div className="bc-top">
                  <div className="bc-id-wrap">
                    <span className="bc-crop">🌾 {b.crop}</span>
                    <span className="bc-id">{b.id}</span>
                  </div>
                  <span className="bc-value">₹{(b.qty * b.price).toLocaleString("en-IN")}</span>
                </div>

                {/* DETAILS */}
                <div className="bc-details">
                  <span>📦 {b.qty} kg</span>
                  <span>💰 ₹{b.price}/kg</span>
                  <span>👤 {b.buyer}</span>
                  <span>📍 {b.dest}</span>
                  <span>📅 {b.date}</span>
                </div>

                {/* PROGRESS TRACK */}
                <div className="bc-track">
                  {TX[lang].statuses.map((s,i) => (
                    <div key={i} className={`bc-step ${i <= b.status ? "done" : ""} ${i === b.status ? "active" : ""}`}>
                      <div className="bc-step-dot">{STATUS_ICONS[i]}</div>
                      <span className="bc-step-lbl">{s}</span>
                      {i < 3 && <div className={`bc-step-line ${i < b.status ? "done" : ""}`}/>}
                    </div>
                  ))}
                </div>

                {/* STATUS UPDATE */}
                {b.status < 3 && (
                  <button className="bc-next-btn" onClick={()=>updateStatus(b.id, 1)}>
                    {STATUS_ICONS[b.status+1]} {lang==="en" ? `Mark as "${TX[lang].statuses[b.status+1]}"` : `"${TX[lang].statuses[b.status+1]}" म्हणून नोंदवा`}
                  </button>
                )}
                {b.status === 3 && (
                  <div className="bc-sold-badge">✅ {TX[lang].statuses[3]}</div>
                )}

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisoryPage;