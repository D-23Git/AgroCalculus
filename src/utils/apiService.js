const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5003/api';

const apiService = {
    // --- AUTHENTICATION ---
    sendOtp: async (credentials) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            return { error: 'Server unreachable' };
        }
    },

    verifyOtp: async (credentials, otp, name) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...credentials, otp, name })
            });
            const data = await response.json();
            if (!response.ok) return { error: data.msg || 'Verification failed' };
            return data;
        } catch (error) {
            return { error: 'Server error' };
        }
    },

    // --- FIELD MANAGEMENT ---
    getFields: async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/fields`, {
                headers: { 'x-auth-token': token }
            });
            return await response.json();
        } catch (error) {
            return { error: 'Fetch failed' };
        }
    },

    addField: async (token, fieldData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/fields`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(fieldData)
            });
            return await response.json();
        } catch (error) {
            return { error: 'Save failed' };
        }
    },

    deleteField: async (token, fieldId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/fields/${fieldId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            return await response.json();
        } catch (error) {
            return { error: 'Delete failed' };
        }
    },

    // --- LEDGER RECORDS ---
    uploadReceipt: async (token, file) => {
        try {
            const formData = new FormData();
            formData.append('receipt', file);
            const response = await fetch(`${API_BASE_URL}/records/upload`, {
                method: 'POST',
                headers: { 'x-auth-token': token },
                body: formData
            });
            return await response.json();
        } catch (error) {
            return { error: 'Upload failed' };
        }
    },

    getRecords: async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/records`, {
                headers: { 'x-auth-token': token }
            });
            return await response.json();
        } catch (error) {
            return { error: 'Fetch failed' };
        }
    },

    addRecord: async (token, recordData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(recordData)
            });
            return await response.json();
        } catch (error) {
            return { error: 'Save failed' };
        }
    },

    updateRecord: async (token, recordId, recordData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/records/${recordId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(recordData)
            });
            return await response.json();
        } catch (error) {
            return { error: 'Update failed' };
        }
    },

    deleteRecord: async (token, recordId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/records/${recordId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            return await response.json();
        } catch (error) {
            return { error: 'Delete failed' };
        }
    },

    // --- VILLAGE CONNECT ---
    getNotices: async (village) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/notices?village=${encodeURIComponent(village)}`);
            return await res.json();
        } catch (e) { return { error: 'Fetch failed' }; }
    },
    addNotice: async (noticeData) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/notices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noticeData)
            });
            return await res.json();
        } catch (e) { return { error: 'Save failed' }; }
    },
    deleteNotice: async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/notices/${id}`, { method: 'DELETE' });
            return await res.json();
        } catch (e) { return { error: 'Delete failed' }; }
    },
    getGrievances: async (village) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/grievances?village=${encodeURIComponent(village)}`);
            return await res.json();
        } catch (e) { return { error: 'Fetch failed' }; }
    },
    addGrievance: async (data) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/grievances`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) { return { error: 'Save failed' }; }
    },
    updateGrievanceStatus: async (id, status) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/grievances/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            return await res.json();
        } catch (e) { return { error: 'Update failed' }; }
    },
    getApplications: async (village, user) => {
        try {
            let url = `${API_BASE_URL}/village/applications?village=${encodeURIComponent(village)}`;
            if (user) url += `&user=${encodeURIComponent(user)}`;
            const res = await fetch(url);
            return await res.json();
        } catch (e) { return { error: 'Fetch failed' }; }
    },
    addApplication: async (data) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) { return { error: 'Save failed' }; }
    },
    updateApplicationStatus: async (id, status) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/applications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            return await res.json();
        } catch (e) { return { error: 'Update failed' }; }
    },
    getPosts: async (village) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/posts?village=${encodeURIComponent(village)}`);
            return await res.json();
        } catch (e) { return { error: 'Fetch failed' }; }
    },
    addPost: async (data) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) { return { error: 'Save failed' }; }
    },
    likePost: async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/like/${id}`, { method: 'POST' });
            return await res.json();
        } catch (e) { return { error: 'Like failed' }; }
    },
    addComment: async (id, data) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/comment/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) { return { error: 'Comment failed' }; }
    },
    villageStaffLogin: async (data) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/staff/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) { return { error: 'Login failed' }; }
    },
    villageJoin: async (data) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) { return { error: 'Join failed' }; }
    },
    getVillageList: async (pincode, taluka) => {
        try {
            let url = `${API_BASE_URL}/village/list?`;
            if (pincode) url += `pincode=${pincode}`;
            if (taluka) url += `&taluka=${taluka}`;
            const res = await fetch(url);
            return await res.json();
        } catch (e) { return []; }
    },
    getDistricts: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/districts`);
            return await res.json();
        } catch (e) { return []; }
    },
    getTalukas: async (district) => {
        try {
            const res = await fetch(`${API_BASE_URL}/village/talukas?district=${encodeURIComponent(district)}`);
            return await res.json();
        } catch (e) { return []; }
    },

    // --- MARKET HUB ---
    getMandiPricesLive: async (mandiId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/market/prices/live/${mandiId}`);
            return await res.json();
        } catch (e) { return { error: 'Fetch failed' }; }
    },
    getMandiPrices: async (mandiId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/market/prices/${mandiId}`);
            return await res.json();
        } catch (e) { return { error: 'Fetch failed' }; }
    },
    updateMandiPrice: async (data) => {
        try {
            const res = await fetch(`${API_BASE_URL}/market/prices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) { return { error: 'Update failed' }; }
    },
    getMandiLogs: async (mandiId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/market/logs/${mandiId}`);
            return await res.json();
        } catch (e) { return { error: 'Fetch failed' }; }
    },
    addMandiLog: async (data) => {
        try {
            const res = await fetch(`${API_BASE_URL}/market/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) { return { error: 'Save failed' }; }
    },
    updateMandiLogStatus: async (id, status, outTime) => {
        try {
            const res = await fetch(`${API_BASE_URL}/market/logs/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, outTime })
            });
            return await res.json();
        } catch (e) { return { error: 'Update failed' }; }
    },
    getMandiAlerts: async (mandiId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/market/alerts/${mandiId}`);
            return await res.json();
        } catch (e) { return { error: 'Fetch failed' }; }
    },
    addMandiAlert: async (data) => {
        try {
            const res = await fetch(`${API_BASE_URL}/market/alerts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) { return { error: 'Save failed' }; }
    },
    
    // --- LOGISTICS ---
    addLogisticsRequest: async (token, data) => {
        try {
            const res = await fetch(`${API_BASE_URL}/market/logistics`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) { return { error: 'Request failed' }; }
    },
    getLogisticsRequests: async (mandiId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/market/logistics/${mandiId}`);
            return await res.json();
        } catch (e) { return { error: 'Fetch failed' }; }
    },
    updateLogisticsStatus: async (id, status, fee) => {
        try {
            const body = { status };
            if (fee) body.fee = fee;
            const res = await fetch(`${API_BASE_URL}/market/logistics/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            return await res.json();
        } catch (e) { return { error: 'Update failed' }; }
    },
    deleteMandiAlert: async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/market/alerts/${id}`, { method: 'DELETE' });
            return await res.json();
        } catch (e) { return { error: 'Delete failed' }; }
    },

    // --- EXTERNAL APIs ---
    getWeather: async (city = 'Pune') => {
        try {
            const response = await fetch(`${API_BASE_URL}/external/weather?city=${city}`);
            return await response.json();
        } catch (error) {
            return { error: 'Weather fetch failed' };
        }
    },
    
    // --- STAFF AUTH ---
    staffLogin: async (data) => {
        try {
            const res = await fetch(`${API_BASE_URL}/market/staff/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) { return { error: 'Login failed' }; }
    },
    // --- SCHEMES HUB ---
    getSchemes: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/schemes`);
            return await res.json();
        } catch (e) { return []; }
    },
    applyForScheme: async (data) => {
        try {
            const res = await fetch(`${API_BASE_URL}/schemes/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) { return { error: 'Application failed' }; }
    },
    checkSchemeStatus: async (refId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/schemes/status/${refId}`);
            return await res.json();
        } catch (e) { return { error: 'Status check failed' }; }
    },
    seedSchemes: async (schemes) => {
        try {
            const res = await fetch(`${API_BASE_URL}/schemes/seed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schemes })
            });
            return await res.json();
        } catch (e) { return { error: 'Seeding failed' }; }
    },
    // --- NEWS HUB ---
    getNews: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/news`);
            return await res.json();
        } catch (e) { return []; }
    },
    seedNews: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/news/seed`, { method: 'POST' });
            return await res.json();
        } catch (e) { return { error: 'Seeding news failed' }; }
    },
    // --- SUPER ADMIN ANALYTICS ---
    getAnalytics: async (token) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/analytics`, {
                headers: { 'x-auth-token': token }
            });
            return await res.json();
        } catch (e) { return { error: 'Analytics fetch failed' }; }
    }
};

export default apiService;
