import React, { useState, useEffect } from "react";
import "./Villageconnect.css";
import api from '../utils/apiService';

/* ═══════════════════════════════════════════════════════
   AUTHENTIC VILLAGE & GRAM PANCHAYAT DATABASE
═══════════════════════════════════════════════════════ */

const DESIGNATIONS = ["Sarpanch", "Up-Sarpanch", "Gramsevak", "Talathi", "Member", "ZP Representative"];
const PIN_VILLAGE_MAP = {
  "412209": ["Ranjangaon Ganpati", "Kondhapuri", "Nimgaon Mahalungi", "Karanjawane", "Ganegaon Khalsa", "Bhambarde"],
  "411057": ["Wakad", "Hinjewadi", "Punawale", "Marunji"],
  "411041": ["Wadgaon Budruk", "Dhayari", "Narhe", "Ambegaon"]
};

const VILLAGE_DATA = {
  "Ranjangaon Ganpati": {
    district: "Pune", taluka: "Shirur", population: "18,500", area: "2,500 Hectares", established: "1850",
    heroImg: "https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&w=1200&q=80",
    history: "A historical village known for the Ashtavinayak Mahaganpati Temple. Today, it is a major industrial hub.",
    officials: { sarpanch: { name: "Hon. Suvarnatai Waydande" }, gramsevak: { name: "Shri. S. V. Deshmukh" } },
    gp_members: [{ name: "Shri. Rahul Shinde", role: "Deputy Sarpanch" }, { name: "Sau. Meena Kale", role: "Member" }],
    amenities: [{ id: 1, name: "Health Center", icon: "🏥", desc: "24/7 emergency services." }, { id: 2, name: "Z.P. School", icon: "🏫", desc: "Digital classrooms." }],
    projects: [{ name: "Solar Lighting", progress: 85 }, { name: "Village Road", progress: 100 }]
  },
  "Kondhapuri": {
    district: "Pune", taluka: "Shirur", population: "9,200", area: "1,800 Hectares", established: "1892",
    heroImg: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    history: "Famous for its agricultural diversity and local cattle market. Known for the progressive farming community.",
    officials: { sarpanch: { name: "Hon. Pandurang Gaikwad" }, gramsevak: { name: "Shri. R. K. Patil" } },
    gp_members: [{ name: "Sau. Sunita Pawar", role: "Member" }],
    amenities: [{ id: 1, name: "Veterinary Clinic", icon: "🐄", desc: "Animal health care." }],
    projects: [{ name: "Canal Cleaning", progress: 60 }]
  },
  "Nimgaon Mahalungi": {
    district: "Pune", taluka: "Shirur", population: "12,400", area: "2,100 Hectares", established: "1905",
    heroImg: "https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&w=1200&q=80",
    history: "A village with deep cultural roots and traditional farming practices. Major onion production hub.",
    officials: { sarpanch: { name: "Hon. Shivajirao Babar" }, gramsevak: { name: "Shri. M. N. Shinde" } },
    gp_members: [{ name: "Shri. Amol Kale", role: "Member" }],
    amenities: [{ id: 1, name: "Market Yard", icon: "🌾", desc: "Onion auction center." }],
    projects: [{ name: "Water Tank", progress: 90 }]
  },
  "Bhor": {
    district: "Pune", taluka: "Bhor", population: "22,000", area: "3,200 Hectares", established: "1720",
    heroImg: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80",
    history: "Historical capital of Bhor State. Famous for the Rajwada and proximity to Bhatghar Dam.",
    officials: { sarpanch: { name: "Hon. Malojirao Raje" }, gramsevak: { name: "Shri. S. T. Kadam" } },
    gp_members: [{ name: "Sau. Jyoti Tai", role: "Member" }],
    amenities: [{ id: 1, name: "Museum", icon: "🏛️", desc: "Cultural heritage." }],
    projects: [{ name: "Dam Maintenance", progress: 75 }]
  },
  "Saswad": {
    district: "Pune", taluka: "Saswad", population: "35,000", area: "2,800 Hectares", established: "1650",
    heroImg: "https://images.unsplash.com/photo-1516402324632-680327499f52?auto=format&fit=crop&w=1200&q=80",
    history: "Birthplace of Sopandev Maharaj. Famous for figs (Anjeer) and custard apples (Sitaphal).",
    officials: { sarpanch: { name: "Hon. Sopanrao Jagtap" }, gramsevak: { name: "Shri. V. V. Bhujbal" } },
    gp_members: [{ name: "Shri. Nilesh Memane", role: "Member" }],
    amenities: [{ id: 1, name: "Fruit Market", icon: "🍎", desc: "Largest fig market." }],
    projects: [{ name: "Anjeer Processing", progress: 80 }]
  }
};

const TX = {
  en: {
    title: "Village Connect", subtitle: "Digital Portal for Rural Excellence", home: "Back to Home",
    step1: "Select State", step2: "Select District", step3: "Taluka & Pincode", step4: "Choose Village", step5: "Select Role", step6: "Profile Details",
    next: "Continue", back: "Go Back", logout: "Logout / Exit",
    nav_overview: "Overview", nav_gp: "Gram Panchayat", nav_notices: "Notices", nav_community: "Community",
    pop: "Population", area: "Area", est: "Est.", gp_title: "GP Administration",
    request_cert: "Service Request", lodge_complaint: "Lodge Complaint",
    post_placeholder: "What's on your mind?", post_btn: "Post", tag_sell: "Sell", tag_help: "Help", tag_update: "Update",
    amenities: "Amenities", projects: "Projects", admin_login: "Official Login", post_notice: "Post Notice",
    notice_title_p: "Title", notice_msg_p: "Details...", role_v: "Villager", role_a: "Authority",
    role_desc_v: "Access services & feed.", role_desc_a: "Administer the village.",
    pin_label: "Admin PIN", pin_err: "Invalid PIN!", manage_apps: "Review Apps", view_grievances: "Grievances", revenue: "Revenue",
    grievance_title: "Complaint Box", status_pending: "Pending", status_solved: "Solved",
    solve_btn: "Solve", msg_btn: "Message", notice_success: "Notice Published!",
    fullname_p: "Full Name", designation_p: "Designation", posted_by: "By", at: "at", lang: "English", photo_view: "View Photo",
    app_details: "Application Details", applicant: "Applicant", type: "Type", date: "Date", status: "Status", approve: "Approve", reject: "Reject",
    details: "Details", close: "Close", ward: "Ward", aadhaar: "Aadhaar No", reason: "Reason", phone: "Phone"
  },
  mr: {
    title: "गाव कनेक्ट", subtitle: "ग्रामीण विकासासाठी डिजिटल पोर्टल", home: "मुख्य पान",
    step1: "राज्य निवडा", step2: "जिल्हा निवडा", step3: "तालुका आणि पिनकोड", step4: "गाव निवडा", step5: "तुमची भूमिका निवडा", step6: "प्रोफाईल माहिती",
    next: "पुढे जा", back: "मागे जा", logout: "बाहेर पडा",
    nav_overview: "गावाची माहिती", nav_gp: "ग्रामपंचायत", nav_notices: "शासकीय सूचना", nav_community: "ग्रामस्थ कट्टा",
    pop: "लोकसंख्या", area: "क्षेत्रफळ", est: "स्थापना", gp_title: "ग्रामपंचायत प्रशासन",
    request_cert: "दाखला / अर्ज", lodge_complaint: "तक्रार नोंदवा",
    post_placeholder: "तुमच्या मनात काय आहे?", post_btn: "पोस्ट करा", tag_sell: "विक्री", tag_help: "मदत", tag_update: "अपडेट",
    amenities: "सुविधा", projects: "विकास कामे", admin_login: "शासकीय लॉगिन", post_notice: "सूचना टाका",
    notice_title_p: "शीर्षक", notice_msg_p: "माहिती...", role_v: "गावकरी", role_a: "प्रशासन",
    role_desc_v: "सेवा आणि फीडसाठी.", role_desc_a: "गाव व्यवस्थापनासाठी.",
    pin_label: "अ‍ॅडमिन पिन", pin_err: "चुकीचा पिन!", manage_apps: "अर्ज तपासा", view_grievances: "तक्रारी पहा", revenue: "महसूल ट्रॅकर",
    grievance_title: "तक्रार पेटी", status_pending: "प्रलंबित", status_solved: "सोडवली",
    solve_btn: "पूर्ण झाले", msg_btn: "मेसेज", notice_success: "सूचना प्रसिद्ध झाली!",
    fullname_p: "पूर्ण नाव", designation_p: "पद निवडा", posted_by: "यांनी प्रसिद्ध", at: "वेळ", lang: "मराठी", photo_view: "फोटो पहा",
    app_details: "अर्जाची सविस्तर माहिती", applicant: "अर्जदार", type: "अर्जाचा प्रकार", date: "तारीख", status: "स्थिती", approve: "मंजूर करा", reject: "नाकारू नका",
    details: "सविस्तर माहिती", close: "बंद करा", ward: "प्रभाग", aadhaar: "आधार क्रमांक", reason: "अर्जाचे कारण", phone: "मोबाईल"
  }
};

export default function VillageConnect({ onNavigate, lang: initialLang = "mr" }) {
  const [currentLang, setCurrentLang] = useState(initialLang);
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({ state: "Maharashtra", district: "", taluka: "", pincode: "", village: "", role: "", fullName: "", designation: "" });
  const [availableVillages, setAvailableVillages] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const [adminPin, setAdminPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [viewingApp, setViewingApp] = useState(null);
  const [viewingGrievance, setViewingGrievance] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [notification, setNotification] = useState("");

  const [notices, setNotices] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [applications, setApplications] = useState([]);
  const [posts, setPosts] = useState([]);

  const [newNotice, setNewNotice] = useState({ title: "", msg: "" });
  const [newPost, setNewPost] = useState("");
  const [postTag, setPostTag] = useState("update");

  // NOTIFICATION BADGES
  const [unreadNotices, setUnreadNotices] = useState(0);

  // FORM STATES (Reliable Submission)
  const [appForm, setAppForm] = useState({ type: 'New Water Connection', aadhaar: '', reason: '' });
  const [grievanceForm, setGrievanceForm] = useState({ ward: '', msg: '', phone: '' });

  const [activeCommentsPost, setActiveCommentsPost] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const noticesRef = React.useRef(notices);
  useEffect(() => { noticesRef.current = notices; }, [notices]);

  const t = TX[currentLang];
  const currentVillageData = VILLAGE_DATA[selection.village] || VILLAGE_DATA["Ranjangaon Ganpati"];

  useEffect(() => {
    const fetchInit = async () => {
       if (isJoined && selection.village) {
          try {
             const [n, g, a, p] = await Promise.all([
                api.getNotices(selection.village),
                api.getGrievances(selection.village),
                api.getApplications(selection.village),
                api.getPosts(selection.village)
             ]);
             
             if (!n.error) {
                const currentNotices = noticesRef.current;
                if (!isAdmin && n.length > currentNotices.length && currentNotices.length > 0) {
                   const newOnes = n.filter(x => !currentNotices.find(prev => (prev._id || prev.id) === (x._id || x.id)));
                   if (newOnes.length > 0) {
                      setUnreadNotices(prev => prev + newOnes.length);
                      if (activeTab !== 'notices') {
                         setNotification(`📢 नवीन शासकीय सूचना: ${newOnes[0].title}`);
                         setTimeout(() => setNotification(""), 8000);
                      }
                   }
                }
                setNotices(n);
             }
             if (!g.error) setGrievances(g);
             if (!a.error) setApplications(a);
             if (!p.error) {
                const dummies = [
                  { _id: 'd1', user: 'सुनील पाटील', msg: '५०० किलो सेंद्रिय कांदे विक्रीसाठी उपलब्ध आहेत.', tag: 'sell', likes: 12, comments: [] },
                  { _id: 'd2', user: 'विष्णू जाधव', msg: 'अस्सल गावठी तूप घरपोच मिळेल. रु. ८५० किलो.', tag: 'sell', likes: 28, comments: [] },
                  { _id: 'd3', user: 'संजय देशमुख', msg: 'शेतीकामासाठी ट्रॅक्टर भाड्याने हवा आहे.', tag: 'help', likes: 5, comments: [] }
                ];
                setPosts([...p, ...dummies]);
             }
          } catch (e) { console.error("Refresh error", e); }
       }
    };
    fetchInit();
    const interval = setInterval(fetchInit, 30000);
    return () => clearInterval(interval);
  }, [selection.village, isJoined, activeTab]);

  useEffect(() => {
    const fetchLocations = async () => {
       const dList = await api.getDistricts();
       setDistricts(dList);
    };
    fetchLocations();
  }, []);

  useEffect(() => {
     const fetchTalukas = async () => {
        if (selection.district) {
           const tList = await api.getTalukas(selection.district);
           setTalukas(tList);
        } else {
           setTalukas([]);
        }
     };
     fetchTalukas();
  }, [selection.district]);

  useEffect(() => {
    const loadVillages = async () => {
      const pin = selection.pincode.trim();
      const taluka = selection.taluka;
      if (pin.length === 6 || taluka) {
         const list = await api.getVillageList(pin.length === 6 ? pin : null, taluka);
         setAvailableVillages(list);
      } else {
         setAvailableVillages([]);
      }
    };
    loadVillages();
  }, [selection.pincode, selection.taluka]);

  const handleNext = async () => {
    if (step < 6) setStep(step + 1);
    else {
      if (selection.role === 'authority') {
        const loginData = { 
          village: selection.village, 
          staffId: `VILL-${selection.fullName.substring(0,3).toUpperCase()}`, // Generate a staff ID
          pin: adminPin,
          name: selection.fullName,
          designation: selection.designation
        };
        const res = await api.villageStaffLogin(loginData);
        if (res.success) { 
           setIsAdmin(true); 
           setIsJoined(true); 
        } else { 
           setPinError(true); 
        }
      } else { 
        // Track Villager Entry
        await api.villageJoin({
           village: selection.village,
           name: selection.fullName,
           role: 'villager'
        });
        setIsAdmin(false); 
        setIsJoined(true); 
      }
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    const postData = { village: selection.village, user: selection.fullName, msg: newPost, tag: postTag };
    const res = await api.addPost(postData);
    if (!res.error) { setPosts([res, ...posts]); setNewPost(""); }
  };

  const handleAddNotice = async () => {
    if (!newNotice.title || !newNotice.msg) { alert("Please enter title and message"); return; }
    setIsPublishing(true);
    const noticeData = { 
       village: selection.village, 
       title: newNotice.title, 
       msg: newNotice.msg, 
       official: selection.designation, 
       officialName: selection.fullName,
       date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    };
    console.log("🚀 Publishing Notice:", noticeData);
    const res = await api.addNotice(noticeData);
    setIsPublishing(false);
    if (!res.error) { 
       setNotices([res, ...notices]); 
       setNewNotice({ title: "", msg: "" }); 
       setNotification(t.notice_success); 
       setTimeout(() => setNotification(""), 3000); 
    } else {
       alert("Publishing failed. Check console.");
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    console.log("🗑️ Attempting to delete notice:", id);
    const res = await api.deleteNotice(id);
    if (!res.error) {
       setNotices(notices.filter(n => (n._id || n.id) !== id));
       setNotification("Notice Deleted");
       setTimeout(() => setNotification(""), 3000);
    } else {
       alert("Delete failed: " + (res.error || "Unknown error"));
    }
  };

  const handleAppAction = async (id, status) => {
    const res = await api.updateApplicationStatus(id, status);
    if (!res.error) {
      setApplications(applications.map(app => app.id === id || app._id === id ? res : app));
      setViewingApp(null);
      setNotification(status === 'approved' ? "Approved!" : "Rejected!");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const handleGrievanceAction = async (id, status) => {
    const res = await api.updateGrievanceStatus(id, status);
    if (!res.error) {
       setGrievances(grievances.map(g => g._id === id ? res : g));
       setViewingGrievance(null);
       setNotification(`Complaint ${status.toUpperCase()}!`);
       setTimeout(() => setNotification(""), 3000);
    }
  };

  const handleLogout = () => { setIsJoined(false); setStep(1); setAdminPin(""); setSelection({...selection, fullName: "", designation: "", role: ""}); };

  if (!isJoined) {
    return (
      <div className="selection-view">
        <div className="vc-bg-anim"></div>
        <div className="vc-lang-toggle-top"><button className={currentLang === 'mr' ? 'active' : ''} onClick={() => setCurrentLang('mr')}>मराठी</button><button className={currentLang === 'en' ? 'active' : ''} onClick={() => setCurrentLang('en')}>English</button></div>
        <button className="vc-home-float" onClick={() => onNavigate("home")}><span className="icon">🏠</span> {t.home}</button>
        <div className="vc-selection-container">
          <div className="vc-header-stack"><h1 className="vc-sel-title">{t.title}</h1><p className="vc-sel-subtitle">{t.subtitle}</p></div>
          <div className="vc-selection-card">
            <div className="vc-step-progress">{[1, 2, 3, 4, 5, 6].map(s => (<div key={s} className={`vc-step-node ${step >= s ? "active" : ""}`}><span>{s}</span></div>))}</div>
            <div className="vc-form-anim-container">
              {step === 1 && (<div className="vc-form-group slide-in"><label>{t.step1}</label><select className="vc-select-input" value={selection.state} onChange={(e) => setSelection({...selection, state: e.target.value})}><option value="Maharashtra">Maharashtra</option></select></div>)}
              {step === 2 && (<div className="vc-form-group slide-in"><label>{t.step2}</label><select className="vc-select-input" value={selection.district} onChange={(e) => setSelection({...selection, district: e.target.value})}><option value="">-- {t.step2} --</option>{districts.map(d => <option key={d} value={d}>{d}</option>)}</select></div>)}
              {step === 3 && (<div className="slide-in"><div className="vc-form-group"><label>तालुका (Taluka)</label><select className="vc-select-input" value={selection.taluka} onChange={(e) => setSelection({...selection, taluka: e.target.value})}><option value="">-- तालुका निवडा --</option>{talukas.map(tl => <option key={tl} value={tl}>{tl}</option>)}</select></div><div className="vc-form-group"><label>पिनकोड (Pincode)</label><input type="text" className="vc-text-input" placeholder=" उदा. 412209" maxLength={6} value={selection.pincode} onChange={(e) => setSelection({...selection, pincode: e.target.value})} /></div></div>)}
              {step === 4 && (<div className="vc-form-group slide-in"><label>{t.step4}</label><select className="vc-select-input" value={selection.village} onChange={(e) => setSelection({...selection, village: e.target.value})}><option value="">-- {t.step4} --</option>{availableVillages.map(v => <option key={v} value={v}>{v}</option>)}</select></div>)}
              {step === 5 && (<div className="vc-form-group slide-in"><label>{t.step5}</label><div className="vc-role-selector"><div className={`vc-role-card ${selection.role === 'villager' ? 'active' : ''}`} onClick={() => setSelection({...selection, role: 'villager'})}><div className="role-icon">👨‍🌾</div><div className="role-txt"><h3>{t.role_v}</h3><p>{t.role_desc_v}</p></div></div><div className={`vc-role-card ${selection.role === 'authority' ? 'active' : ''}`} onClick={() => setSelection({...selection, role: 'authority'})}><div className="role-icon">🏛️</div><div className="role-txt"><h3>{t.role_a}</h3><p>{t.role_desc_a}</p></div></div></div></div>)}
              {step === 6 && (<div className="slide-in"><div className="vc-form-group"><label>{t.fullname_p}</label><input type="text" className="vc-text-input" placeholder=" उदा. राजेश पाटील" value={selection.fullName} onChange={(e) => setSelection({...selection, fullName: e.target.value})} /></div>{selection.role === 'authority' && (<><div className="vc-form-group"><label>{t.designation_p}</label><select className="vc-select-input" value={selection.designation} onChange={(e) => setSelection({...selection, designation: e.target.value})}><option value="">-- पद निवडा --</option>{DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}</select></div><div className="vc-form-group"><label>{t.pin_label}</label><input type="password" className={`vc-text-input ${pinError ? 'error-border' : ''}`} placeholder="****" maxLength={4} value={adminPin} onChange={(e) => {setAdminPin(e.target.value); setPinError(false);}} />{pinError && <p className="vc-pin-err-msg">{t.pin_err}</p>}</div></>)}</div>)}
            </div>
            <div className="vc-selection-actions">{step > 1 && <button className="vc-btn-back" onClick={() => setStep(step - 1)}>{t.back}</button>}<button className="vc-btn-next" onClick={handleNext} disabled={(step === 2 && !selection.district) || (step === 3 && !selection.taluka) || (step === 4 && !selection.village) || (step === 5 && !selection.role) || (step === 6 && !selection.fullName) || (step === 6 && selection.role === 'authority' && !selection.designation)}>{step === 6 ? "Enter Dashboard" : t.next}</button></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vc-dash-container">
      {notification && <div className="vc-notification-toast">{notification}</div>}
      <aside className="vc-sidebar">
        <div className="vc-sb-header"><div className="vc-sb-logo">🏛️</div><div className="vc-sb-village"><h2>{selection.village}</h2><p>{selection.district}, {selection.state}</p></div></div>
        <div className="vc-sidebar-profile"><div className="vc-profile-avatar">{selection.fullName[0]}</div><div className="vc-profile-info"><h4>{selection.fullName}</h4><p>{selection.role === 'authority' ? selection.designation : t.role_v}</p></div></div>
        <nav className="vc-sb-nav">
          <button className={`vc-sb-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><span className="icon">🏠</span> {t.nav_overview}</button>
          <button className={`vc-sb-link ${activeTab === 'gp' ? 'active' : ''}`} onClick={() => setActiveTab('gp')}><span className="icon">🏛️</span> {t.nav_gp}</button>
          <button className={`vc-sb-link ${activeTab === 'notices' ? 'active' : ''}`} style={{ position: 'relative' }} onClick={() => { setActiveTab('notices'); setUnreadNotices(0); }}>
             <span className="icon">📢</span> {t.nav_notices}
             {unreadNotices > 0 && <span className="vc-badge-dot">{unreadNotices}</span>}
          </button>
          <button className={`vc-sb-link ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}><span className="icon">👥</span> {t.nav_community}</button>
        </nav>
        <div className="vc-sb-footer"><button className="vc-btn-exit" onClick={handleLogout}>{t.logout}</button></div>
      </aside>

      <main className="vc-main">
        <header className="vc-hero-banner"><img src={currentVillageData.heroImg} alt="Village" className="vc-hero-img" /><div className="vc-hero-overlay"><div className="vc-hero-content"><span className="vc-welcome-badge">{selection.role === 'authority' ? "Authority" : "Citizen"}</span><h1>Welcome, {selection.fullName.split(' ')[0]}!</h1><p>Digital Portal of {selection.village}</p></div></div></header>

        {activeTab === 'overview' && (
          <div className="fade-in">
            <div className="vc-stats-row"><div className="vc-stat-card"><span className="vc-stat-val">{currentVillageData.population}</span><span className="vc-stat-lbl">{t.pop}</span></div><div className="vc-stat-card"><span className="vc-stat-val">{currentVillageData.area}</span><span className="vc-stat-lbl">{t.area}</span></div><div className="vc-stat-card"><span className="vc-stat-val">{currentVillageData.established}</span><span className="vc-stat-lbl">{t.est}</span></div></div>
            <div className="vc-grid">
              <div className="vc-card"><h3 className="vc-section-title">📜 History & Heritage</h3><p className="vc-history-p">{currentVillageData.history}</p><h3 className="vc-section-title" style={{ marginTop: '40px' }}>🛠️ {t.projects}</h3><div className="vc-projects-list">{currentVillageData.projects.map((p, i) => (<div key={i} className="vc-project-item"><div className="vc-project-info"><span className="vc-project-name">{p.name}</span><span className="vc-project-perc">{p.progress}%</span></div><div className="vc-progress-bar"><div className="vc-progress-fill" style={{ width: `${p.progress}%` }}></div></div></div>))}</div></div>
              <div className="vc-card"><h3 className="vc-section-title">👤 Village Leadership</h3><div className="vc-leadership-grid"><div className="vc-leader-mini"><div className="vc-leader-avatar sarpanch">S</div><div><h4>{currentVillageData.officials.sarpanch.name}</h4><p>Sarpanch</p></div></div><div className="vc-leader-mini"><div className="vc-leader-avatar gramsevak">G</div><div><h4>{currentVillageData.officials.gramsevak.name}</h4><p>Gramsevak</p></div></div></div><h3 className="vc-section-title" style={{ marginTop: '40px' }}>🏢 {t.amenities}</h3><div className="vc-amenities-stack">{currentVillageData.amenities.map((a) => (<div key={a.id} className="vc-amenity-item clickable" onClick={() => setSelectedAmenity(a)}><span className="vc-amenity-icon">{a.icon}</span><div className="vc-amenity-details"><h5 className="vc-amenity-name">{a.name}</h5><p className="vc-amenity-status">● Active</p></div></div>))}</div></div>
            </div>
          </div>
        )}

        {activeTab === 'gp' && (
          <div className="fade-in">
            <h2 className="vc-section-title">🏛️ {t.gp_title}</h2>
            <div className="vc-grid"><div className="vc-card"><h3 className="vc-section-title">{isAdmin ? t.manage_apps : "ई-सेवा"}</h3><div className="vc-services-grid"><button className="vc-svc-btn" onClick={() => setShowServiceForm(true)}><span className="icon">📜</span><span>{isAdmin ? t.manage_apps : t.request_cert}</span></button><button className="vc-svc-btn" onClick={() => setShowGrievanceModal(true)}><span className="icon">⚠️</span><span>{isAdmin ? t.view_grievances : t.lodge_complaint}</span></button><button className="vc-svc-btn" onClick={() => isAdmin ? setShowRevenueModal(true) : alert("Coming Soon!")}><span className="icon">💰</span><span>{isAdmin ? t.revenue : "Tax"}</span></button></div></div></div>
          </div>
        )}

        {activeTab === 'notices' && (
          <div className="fade-in">
            <h2 className="vc-section-title">📢 {t.nav_notices}</h2>
            {isAdmin && (<div className="vc-card admin-composer" style={{ marginBottom: '30px', border: '2px dashed var(--gp-secondary)' }}><h3>{t.post_notice}</h3><input type="text" className="vc-text-input" placeholder={t.notice_title_p} value={newNotice.title} onChange={(e) => setNewNotice({...newNotice, title: e.target.value})} /><textarea className="vc-text-input" style={{ marginTop: '10px' }} placeholder={t.notice_msg_p} value={newNotice.msg} onChange={(e) => setNewNotice({...newNotice, msg: e.target.value})} /><button className="vc-btn-next" style={{ marginTop: '10px', background: isPublishing ? '#94a3b8' : 'var(--gp-primary)' }} onClick={handleAddNotice} disabled={isPublishing}>{isPublishing ? "Publishing..." : "Publish"}</button></div>)}
            <div className="vc-notice-stack">
              {Array.isArray(notices) ? notices.map(n => {
                const dateParts = (n.date || "").split(' ');
                return (
                  <div key={n._id} className="vc-card notice-item" style={{ marginBottom: '20px', display: 'flex', gap: '30px' }}>
                    <div className="notice-date-box">
                      <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--gp-primary)', display: 'block' }}>{dateParts[0] || '---'}</span>
                      <span style={{ fontWeight: 800, color: 'var(--gp-text-muted)' }}>{dateParts[1] || ''}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ margin: '0' }}>{n.title}</h3>
                        {isAdmin && <button className="tag-btn" style={{ background: '#fee2e2', color: '#ef4444', padding: '5px 12px' }} onClick={() => handleDeleteNotice(n._id)}>🗑️</button>}
                      </div>
                      <p style={{ margin: '10px 0 10px 0', color: '#475569', lineHeight: 1.6 }}>{n.msg}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <small style={{ color: 'var(--gp-primary)', fontWeight: 800 }}>- {n.officialName} ({n.official})</small>
                      </div>
                    </div>
                  </div>
                );
              }) : <p>No notices available.</p>}
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="fade-in">
            <h2 className="vc-section-title">👥 {t.nav_community}</h2>
            {!isAdmin && (<div className="vc-post-composer"><textarea placeholder={t.post_placeholder} value={newPost} onChange={(e) => setNewPost(e.target.value)} /><div className="vc-composer-footer" style={{ justifyContent: 'flex-end' }}><button className="vc-btn-post" style={{ background: 'linear-gradient(135deg, var(--gp-primary), #0d9488)', boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)', padding: '10px 25px' }} onClick={handlePost}>{t.post_btn}</button></div></div>)}
            
            {/* TAG FILTERS */}
            <div className="vc-tag-filters" style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
               <button className={`vc-tag-chip ${postTag === 'all' ? 'active' : ''}`} onClick={() => setPostTag('all')}>🏷️ All</button>
               <button className={`vc-tag-chip ${postTag === 'sell' ? 'active' : ''}`} onClick={() => setPostTag('sell')}>🛍️ {t.tag_sell}</button>
               <button className={`vc-tag-chip ${postTag === 'help' ? 'active' : ''}`} onClick={() => setPostTag('help')}>🆘 {t.tag_help}</button>
               <button className={`vc-tag-chip ${postTag === 'update' ? 'active' : ''}`} onClick={() => setPostTag('update')}>📢 {t.tag_update}</button>
            </div>

            <div className="vc-feed-stack">
              {Array.isArray(posts) ? posts.filter(p => postTag === 'all' || p.tag === postTag || !p.tag).map(p => (
                <div key={p._id} className={`vc-feed-post ${p.tag === 'sell' ? 'sell-type' : p.tag === 'help' ? 'help-type' : ''}`}>
                  <div className="vpost-header">
                    <div className="vpost-user-avatar" style={{ background: 'var(--gp-primary)', color: 'white' }}>{p.user ? p.user[0] : 'U'}</div>
                    <div className="vpost-user-info">
                      <h4 style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.1rem' }}>{p.user}</h4>
                      <span className="vpost-tag-badge">{p.tag}</span>
                    </div>
                  </div>
                  <p className="vpost-content" style={{ fontSize: '1.05rem', color: '#334155' }}>{p.msg}</p>
                  
                  {/* LIKE & ACTIONS */}
                  <div className="vpost-actions" style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                    <button className="vaction-btn" style={{ fontSize: '1.1rem' }} onClick={async () => { 
                      const r = await api.likePost(p._id); 
                      if(!r.error) {
                        const updated = r.mock ? { ...p, likes: (p.likes || 0) + 1 } : r;
                        setPosts(posts.map(x => x._id === p._id ? updated : x)); 
                      }
                    }}>
                      ❤️ {p.likes || 0}
                    </button>
                    <button className="vaction-btn" style={{ fontSize: '1.1rem' }} onClick={() => setActiveCommentsPost(p)}>
                      💬 {p.comments?.length || 0} {t.comments || "Comments"}
                    </button>
                  </div>

                  {/* QUICK COMMENT (Visible on Card) */}
                  {p.comments && p.comments.length > 0 && (
                    <div className="vpost-comments-preview" style={{ marginTop: '10px' }}>
                       <p style={{ color: '#64748b', fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => setActiveCommentsPost(p)}>View all {p.comments.length} comments</p>
                    </div>
                  )}

                  {/* ADD COMMENT INPUT */}
                  <div className="vcomment-input-box" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <input 
                      type="text" 
                      id={`comment-input-${p._id}`}
                      placeholder="Add a comment..." 
                      style={{ flex: 1, border: '2px solid #e2e8f0', borderRadius: '10px', padding: '10px', background: '#f8fafc' }}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const val = e.target.value.trim();
                          if(!val) return;
                          const r = await api.addComment(p._id, { user: selection.fullName, text: val });
                          if (!r.error) {
                            const updated = r.mock ? { ...p, comments: [...(p.comments || []), { user: selection.fullName, text: val, date: new Date() }] } : r;
                            setPosts(posts.map(x => x._id === p._id ? updated : x));
                            e.target.value = "";
                          }
                        }
                      }}
                    />
                    <button className="vc-btn-next" style={{ 
                      padding: '10px 25px', 
                      borderRadius: '12px', 
                      fontSize: '0.95rem', 
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, var(--gp-primary), #0d9488)', 
                      color: 'white',
                      border: 'none',
                      boxShadow: '0 4px 10px rgba(20, 184, 166, 0.2)',
                      transition: 'all 0.2s ease'
                    }} onClick={async () => {
                       const input = document.getElementById(`comment-input-${p._id}`);
                       const val = input.value.trim();
                       if(!val) return;
                       const r = await api.addComment(p._id, { user: selection.fullName, text: val });
                       if (!r.error) {
                         const updated = r.mock ? { ...p, comments: [...(p.comments || []), { user: selection.fullName, text: val, date: new Date() }] } : r;
                         setPosts(posts.map(x => x._id === p._id ? updated : x));
                         input.value = "";
                       }
                    }}>Send</button>
                  </div>
                </div>
              )) : <p>Loading posts...</p>}
            </div>
          </div>
        )}
      </main>

      {/* ── MODALS ── */}
      {viewingApp && (<div className="vc-modal-overlay" onClick={() => setViewingApp(null)}><div className="vc-modal-card" style={{ maxWidth: '600px', textAlign: 'left' }} onClick={e => e.stopPropagation()}><h2 style={{ textAlign: 'center' }}>{t.app_details}</h2><div style={{ color: 'var(--gp-primary)', marginTop: '20px' }}><p><strong>{t.applicant}:</strong> {viewingApp.user}</p><p><strong>{t.type}:</strong> {viewingApp.type}</p><p><strong>{t.aadhaar}:</strong> {viewingApp.aadhaar}</p><p><strong>{t.reason}:</strong> {viewingApp.reason}</p><p><strong>{t.status}:</strong> <span style={{ color: viewingApp.status === 'approved' ? 'var(--gp-accent)' : '#ef4444', fontWeight: 900 }}>{viewingApp.status.toUpperCase()}</span></p></div><div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>{isAdmin && viewingApp.status === 'pending' && <><button className="vc-btn-next" style={{ background: 'var(--gp-accent)' }} onClick={() => handleAppAction(viewingApp._id, 'approved')}>{t.approve}</button><button className="vc-btn-next" style={{ background: '#ef4444' }} onClick={() => handleAppAction(viewingApp._id, 'rejected')}>{t.reject}</button></>}<button className="vc-btn-back" style={{ flex: 1 }} onClick={() => setViewingApp(null)}>{t.close}</button></div></div></div>)}

      {viewingGrievance && (
        <div className="vc-modal-overlay" onClick={() => setViewingGrievance(null)}>
          <div className="vc-modal-card" style={{ maxWidth: '600px', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center' }}>तक्रार तपशील (Grievance Details)</h2>
            <div style={{ color: 'var(--gp-primary)', marginTop: '20px' }}>
              <p><strong>गावाचे नाव:</strong> {selection.village}</p>
              <p><strong>अर्जदार:</strong> {viewingGrievance.user}</p>
              <p><strong>प्रकार:</strong> {viewingGrievance.type} ({viewingGrievance.ward})</p>
              <p><strong>संदेश:</strong> {viewingGrievance.msg}</p>
              <p><strong>संपर्क:</strong> {viewingGrievance.phone}</p>
              <p><strong>स्थिती (Status):</strong> 
                <span style={{ 
                  marginLeft: '10px',
                  color: viewingGrievance.status === 'resolved' ? 'var(--gp-accent)' : viewingGrievance.status === 'rejected' ? '#ef4444' : '#f59e0b', 
                  fontWeight: 900 
                }}>
                  {viewingGrievance.status ? viewingGrievance.status.toUpperCase() : 'PENDING'}
                </span>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              {isAdmin && (viewingGrievance.status !== 'resolved' && viewingGrievance.status !== 'rejected') && (
                <>
                  <button className="vc-btn-next" style={{ background: 'var(--gp-accent)' }} onClick={() => handleGrievanceAction(viewingGrievance._id, 'resolved')}>Resolve</button>
                  <button className="vc-btn-next" style={{ background: '#f59e0b' }} onClick={() => handleGrievanceAction(viewingGrievance._id, 'in_progress')}>In Progress</button>
                  <button className="vc-btn-next" style={{ background: '#ef4444' }} onClick={() => handleGrievanceAction(viewingGrievance._id, 'rejected')}>Reject</button>
                </>
              )}
              <button className="vc-btn-back" style={{ flex: 1 }} onClick={() => setViewingGrievance(null)}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {showServiceForm && (
        <div className="vc-modal-overlay" onClick={() => setShowServiceForm(false)}>
          <div className="vc-modal-card" onClick={e => e.stopPropagation()}>
            <h2>{isAdmin ? t.manage_apps : t.request_cert}</h2>
            <div style={{ marginTop: '20px' }}>
              {isAdmin ? (
                applications.length > 0 ? applications.map(app => (
                  <div key={app._id} className="vc-amenity-item clickable" style={{ marginBottom: '10px' }} onClick={() => { setViewingApp(app); setShowServiceForm(false); }}>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <h4>{app.type}</h4>
                      <p>{t.applicant}: {app.user}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                       <div className="tag-btn active">{t.details}</div>
                       <span style={{ fontSize: '0.75rem', fontWeight: 900, color: app.status === 'approved' ? 'var(--gp-accent)' : app.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>
                          {app.status.toUpperCase()}
                       </span>
                    </div>
                  </div>
                )) : <p>No applications found.</p>
              ) : (
                <div style={{ textAlign: 'left' }}>
                  <div className="vc-form-group">
                    <label>Type</label>
                    <select className="vc-select-input" value={appForm.type} onChange={(e) => setAppForm({...appForm, type: e.target.value})}>
                      <option>New Water Connection</option>
                      <option>NOC Certificate</option>
                      <option>Birth Certificate</option>
                      <option>Income Certificate</option>
                    </select>
                  </div>
                  <div className="vc-form-group">
                    <label>Aadhaar</label>
                    <input type="text" className="vc-text-input" value={appForm.aadhaar} onChange={(e) => setAppForm({...appForm, aadhaar: e.target.value})} />
                  </div>
                  <div className="vc-form-group">
                    <label>Reason</label>
                    <textarea className="vc-text-input" value={appForm.reason} onChange={(e) => setAppForm({...appForm, reason: e.target.value})}></textarea>
                  </div>
                  <button className="vc-btn-next" style={{ width: '100%' }} onClick={async () => { 
                    if(!appForm.aadhaar || !appForm.reason) { alert("Please fill all fields"); return; }
                    const d = { village: selection.village, user: selection.fullName, ...appForm }; 
                    const r = await api.addApplication(d); 
                    if(!r.error) { 
                      setApplications([r, ...applications]); 
                      setShowServiceForm(false); 
                      setAppForm({ type: 'New Water Connection', aadhaar: '', reason: '' }); 
                      alert("Application Submitted Successfully!"); 
                    } 
                  }}>Submit</button>
                </div>
              )}
            </div>
            <button className="vc-btn-back" style={{ width: '100%', marginTop: '20px' }} onClick={() => setShowServiceForm(false)}>{t.close}</button>
          </div>
        </div>
      )}

      {showGrievanceModal && (
        <div className="vc-modal-overlay" onClick={() => setShowGrievanceModal(false)}>
          <div className="vc-modal-card" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <h2>{t.grievance_title}</h2>
            <div style={{ marginTop: '20px' }}>
              {isAdmin ? (
                grievances.length > 0 ? grievances.map(g => (
                  <div key={g._id} className="vc-amenity-item clickable" style={{ marginBottom: '15px' }} onClick={() => { setViewingGrievance(g); setShowGrievanceModal(false); }}>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <h4>{g.type} ({g.ward})</h4>
                      <p>{t.applicant}: {g.user}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                       <div className="tag-btn active">{t.details}</div>
                       <span style={{ fontSize: '0.75rem', fontWeight: 900, color: g.status === 'approved' ? 'var(--gp-accent)' : g.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>
                          {g.status ? g.status.toUpperCase() : 'PENDING'}
                       </span>
                    </div>
                  </div>
                )) : <p>No complaints found.</p>
              ) : (
                <div style={{ textAlign: 'left' }}>
                   <div className="vc-form-group">
                      <label>Ward / Area</label>
                      <input type="text" className="vc-text-input" value={grievanceForm.ward} onChange={(e) => setGrievanceForm({...grievanceForm, ward: e.target.value})} placeholder="e.g. Ward No 4" />
                   </div>
                   <div className="vc-form-group">
                      <label>Complaint Message</label>
                      <textarea className="vc-text-input" value={grievanceForm.msg} onChange={(e) => setGrievanceForm({...grievanceForm, msg: e.target.value})} placeholder="Describe the issue..."></textarea>
                   </div>
                   <div className="vc-form-group">
                      <label>Phone No</label>
                      <input type="text" className="vc-text-input" value={grievanceForm.phone} onChange={(e) => setGrievanceForm({...grievanceForm, phone: e.target.value})} placeholder="10-digit number" />
                   </div>
                   <button className="vc-btn-next" style={{ width: '100%' }} onClick={async () => {
                      if(!grievanceForm.ward || !grievanceForm.msg || !grievanceForm.phone) { alert("Please fill all fields"); return; }
                      const d = { village: selection.village, user: selection.fullName, ...grievanceForm, type: 'Grievance' };
                      const r = await api.addGrievance(d);
                      if(!r.error) { 
                        setGrievances([r, ...grievances]); 
                        setShowGrievanceModal(false); 
                        setGrievanceForm({ ward: '', msg: '', phone: '' }); 
                        alert("Complaint Lodged Successfully!"); 
                      }
                   }}>Submit Complaint</button>
                </div>
              )}
            </div>
            <button className="vc-btn-back" style={{ width: '100%', marginTop: '20px' }} onClick={() => setShowGrievanceModal(false)}>{t.close}</button>
          </div>
        </div>
      )}

      {viewingGrievance && (<div className="vc-modal-overlay" onClick={() => setViewingGrievance(null)}><div className="vc-modal-card" style={{ maxWidth: '600px', textAlign: 'left' }} onClick={e => e.stopPropagation()}><h2 style={{ textAlign: 'center' }}>{t.grievance_title}</h2><div style={{ color: 'var(--gp-primary)', marginTop: '20px' }}><p><strong>{t.applicant}:</strong> {viewingGrievance.user}</p><p><strong>{t.ward}:</strong> {viewingGrievance.ward}</p><p><strong>{t.details}:</strong> {viewingGrievance.msg}</p>{viewingGrievance.photo && <img src={viewingGrievance.photo} alt="Issue" style={{ width: '100%', borderRadius: '15px', marginTop: '15px' }} />}</div><div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}><button className="vc-btn-next" onClick={() => window.open(`https://wa.me/91${viewingGrievance.phone}`)}>{t.msg_btn}</button><button className="vc-btn-back" style={{ flex: 1 }} onClick={() => setViewingGrievance(null)}>{t.close}</button></div></div></div>)}

      {/* COMMENTS DRAWER */}
      {activeCommentsPost && (
        <div className="vc-modal-overlay" onClick={() => setActiveCommentsPost(null)}>
           <div className="vc-drawer-right" onClick={e => e.stopPropagation()} style={{
              position: 'absolute', right: 0, top: 0, height: '100%', width: '400px', 
              background: 'white', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', 
              display: 'flex', flexDirection: 'column', zIndex: 1000, 
              animation: 'slideInRight 0.3s ease-out'
           }}>
              <div className="vc-drawer-header" style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0 }}>💬 {t.nav_community} Comments</h3>
                 <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setActiveCommentsPost(null)}>✕</button>
              </div>
              <div className="vc-drawer-body" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                 {activeCommentsPost.comments?.length > 0 ? activeCommentsPost.comments.map((c, i) => (
                    <div key={i} className="vdrawer-comment" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                       <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gp-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{c.user[0]}</div>
                       <div style={{ flex: 1 }}>
                          <h5 style={{ margin: 0, fontWeight: 900, color: '#1e293b' }}>{c.user}</h5>
                          <p style={{ margin: '5px 0 0 0', color: '#334155', fontSize: '0.95rem', lineHeight: 1.4 }}>{c.text}</p>
                          <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{new Date(c.date || Date.now()).toLocaleTimeString()}</small>
                       </div>
                    </div>
                 )) : <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '50px' }}>No comments yet.</p>}
              </div>
              <div className="vc-drawer-footer" style={{ padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
                 <input 
                    type="text" 
                    placeholder="Write a comment..." 
                    id="drawer-comment-input"
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid #e2e8f0' }}
                    onKeyDown={async (e) => {
                       if (e.key === 'Enter') {
                          const val = e.target.value.trim();
                          if(!val) return;
                          const r = await api.addComment(activeCommentsPost._id, { user: selection.fullName, text: val });
                          if (!r.error) {
                             const updated = r.mock ? { ...activeCommentsPost, comments: [...(activeCommentsPost.comments || []), { user: selection.fullName, text: val, date: new Date() }] } : r;
                             setPosts(posts.map(x => x._id === activeCommentsPost._id ? updated : x));
                             setActiveCommentsPost(updated);
                             e.target.value = "";
                          }
                       }
                    }}
                 />
                 <button className="vc-btn-next" style={{ 
                    background: 'linear-gradient(135deg, var(--gp-primary), #0d9488)', 
                    padding: '12px 25px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 10px rgba(20, 184, 166, 0.2)'
                 }} onClick={async () => {
                    const input = document.getElementById('drawer-comment-input');
                    const val = input.value.trim();
                    if(!val) return;
                    const r = await api.addComment(activeCommentsPost._id, { user: selection.fullName, text: val });
                    if (!r.error) {
                       const updated = r.mock ? { ...activeCommentsPost, comments: [...(activeCommentsPost.comments || []), { user: selection.fullName, text: val, date: new Date() }] } : r;
                       setPosts(posts.map(x => x._id === activeCommentsPost._id ? updated : x));
                       setActiveCommentsPost(updated);
                       input.value = "";
                    }
                 }}>Post</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
