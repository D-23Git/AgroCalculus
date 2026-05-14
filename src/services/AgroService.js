/**
 * ॲग्रो-सर्व्हिस (AgroService)
 * ॲपचा सर्व डेटा (Market, Ledger, Village) सुरक्षितपणे साठवण्यासाठी.
 */

const AgroService = {
  // --- USER PROFILE & RBAC ---
  getProfile: () => {
    const p = localStorage.getItem('agro_profile');
    return p ? JSON.parse(p) : { name: 'शेतकरी', phone: '9876543210' };
  },

  isAdmin: (marketId = null) => {
    if (!marketId) return localStorage.getItem('agro_role') === 'admin';
    return localStorage.getItem(`agro_auth_${marketId}`) === 'true';
  },

  setAdmin: (status, marketId = null) => {
    if (!marketId) {
       localStorage.setItem('agro_role', status ? 'admin' : 'farmer');
    } else {
       localStorage.setItem(`agro_auth_${marketId}`, status ? 'true' : 'false');
    }
  },

  getMarketPIN: (marketId) => {
    // Deterministic PIN for demo: simple hash of the ID
    let hash = 0;
    for (let i = 0; i < marketId.length; i++) {
      hash = ((hash << 5) - hash) + marketId.charCodeAt(i);
      hash |= 0; 
    }
    return Math.abs(hash % 10000).toString().padStart(4, '0');
  },

  getMarketPINHint: (marketId) => {
    return "💡 Hint: Market ID sum mod 10000 (Example: 5555 for demo)";
  },

  // --- MARKET DATA (Persistence) ---
  saveHaggle: (marketId, cropId, offer) => {
    const key = `agro_haggle_${marketId}_${cropId}`;
    localStorage.setItem(key, JSON.stringify({
      ...offer,
      timestamp: new Date().toISOString()
    }));
  },

  getHaggle: (marketId, cropId) => {
    const key = `agro_haggle_${marketId}_${cropId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  // --- MARKET OVERRIDES (Staff Data) ---
  saveMarketUpdate: (marketId, updates) => {
    const key = `agro_mkt_override_${marketId}`;
    const existing = AgroService.getMarketUpdate(marketId);
    localStorage.setItem(key, JSON.stringify({ ...existing, ...updates }));
  },

  getMarketUpdate: (marketId) => {
    const key = `agro_mkt_override_${marketId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : { prices: {}, alerts: [] };
  },

  // --- GRIEVANCES (तक्रार निवारण) ---
  saveGrievance: (report) => {
    const list = JSON.parse(localStorage.getItem('agro_grievances') || '[]');
    list.unshift({ 
      ...report, 
      id: 'AG-' + (Math.floor(Math.random() * 900) + 100), 
      status: 'pending', 
      adminNote: '',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('agro_grievances', JSON.stringify(list));
    return list;
  },

  updateGrievance: (id, status, note = '') => {
    const list = JSON.parse(localStorage.getItem('agro_grievances') || '[]');
    const updated = list.map(g => g.id === id ? { ...g, status, adminNote: note } : g);
    localStorage.setItem('agro_grievances', JSON.stringify(updated));
    return updated;
  },

  getGrievances: () => {
    return JSON.parse(localStorage.getItem('agro_grievances') || '[]');
  },

  // --- VILLAGE CONNECT (Community Feed) ---
  savePost: (post) => {
    const feed = JSON.parse(localStorage.getItem('agro_feed') || '[]');
    feed.unshift({ ...post, id: Date.now(), time: 'आता' });
    localStorage.setItem('agro_feed', JSON.stringify(feed.slice(0, 100))); // Keep last 100
    return feed;
  },

  getFeed: () => {
    return JSON.parse(localStorage.getItem('agro_feed') || '[]');
  },

  // --- GEOLOCATION DISTANCE ---
  getDistance: (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(1));
  }
};

export default AgroService;
