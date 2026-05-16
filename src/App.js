import React, { useState } from "react";
import LoginPage     from "./components/Loginpage";
import LandingPage   from "./components/LandingPage";
import DigitalLedger from "./components/DigitalLedger";
import Villageconnect from "./components/Villageconnect";
import AdvisoryPage  from "./components/AdvisoryPage";
import MarketPage    from "./components/MarketPage";
import SchemesPage   from "./components/SchemesPage";
import AdminDashboard from "./components/AdminDashboard";

const App = () => {
  const [page,    setPage]    = useState("login");
  const [profile, setProfile] = useState(null);
  const [lang,    setLang]    = useState("mr");

  // Restore session on mount (Disabled for demonstration/strict login)
  React.useEffect(() => {
    /*
    const saved = localStorage.getItem("agro_profile");
    const token = localStorage.getItem("agro_token");
    if (saved && token) {
      setProfile(JSON.parse(saved));
      setPage("home");
    }
    */
  }, []);

  const handleLogin = (prof) => {
    setProfile(prof);
    if (prof.role === 'staff') {
      setPage("market");
    } else if (prof.role === 'superadmin' || prof.email === 'badhednyaneshwari23@gmail.com') {
      setPage("analytics");
    } else {
      setPage("home");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("agro_profile");
    localStorage.removeItem("agro_pin");
    localStorage.removeItem("agro_token");
    setProfile(null);
    setPage("login");
  };

  /* ── LOGIN ── */
  if (page === "login") return <LoginPage onLogin={handleLogin} />;

  /* ── HOME ── */
  if (page === "home") {
    return (
      <LandingPage
        profile={profile}
        onNavigate={setPage}
        onLogout={handleLogout}
        lang={lang}
        setLang={setLang}
      />
    );
  }

  /* ── LEDGER ── */
  if (page === "ledger") {
    return (
      <DigitalLedger
        onNavigate={setPage}
        lang={lang}
        profile={profile}
      />
    );
  }

  /* ── MARKET ── */
  if (page === "market") {
    return <MarketPage lang={lang} onNavigate={setPage} profile={profile} />;
  }

  /* ── SCHEMES ── */
  if (page === "schemes") {
    return <SchemesPage onNavigate={setPage} lang={lang} setLang={setLang} />;
  }

  /* ── VILLAGE ── */
  if (page === "village") {
    return <Villageconnect onNavigate={setPage} lang={lang} setLang={setLang} profile={profile} />;
  }

  /* ── ADVISORY ── */
  if (page === "advisory") {
    return <AdvisoryPage onNavigate={setPage} lang={lang} setLang={setLang} profile={profile} />;
  }

  /* ── ANALYTICS (Super Admin only) ── */
  if (page === "analytics") {
    if (!profile || profile.email !== 'badhednyaneshwari23@gmail.com') {
      setPage("home");
      return null;
    }
    return (
      <AdminDashboard
        profile={profile}
        onNavigate={setPage}
        onLogout={handleLogout}
      />
    );
  }

  return null;
};

export default App;