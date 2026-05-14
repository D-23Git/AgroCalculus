const express = require('express');
const { villageConn } = require('../db');
const CommunityPostSchema = require('../models/CommunityPost');
const ApplicationSchema = require('../models/Application');
const GrievanceSchema = require('../models/Grievance');
const NoticeSchema = require('../models/Notice');
const VillageStaffSchema = require('../models/VillageStaff');
const router = express.Router();

const CommunityPost = villageConn.model('CommunityPost', CommunityPostSchema);
const Application = villageConn.model('Application', ApplicationSchema);
const Grievance = villageConn.model('Grievance', GrievanceSchema);
const Notice = villageConn.model('Notice', NoticeSchema);
const VillageStaff = villageConn.model('VillageStaff', VillageStaffSchema);

const axios = require('axios'); // Ensure axios is installed or use fetch

// COMPREHENSIVE MAHARASHTRA DISTRICTS & TALUKAS (ALL 36 DISTRICTS)
const MH_DATA = {
  "Pune": ["Shirur", "Haveli", "Khed", "Ambegaon", "Junner", "Baramati", "Bhor", "Saswad", "Indapur", "Daund", "Maval", "Mulshi", "Velhe", "Purandar"],
  "Nashik": ["Nashik", "Sinnar", "Igatpuri", "Dindori", "Niphad", "Yeola", "Malegaon", "Nandgaon", "Chandwad", "Kalwan", "Baglan", "Surgana", "Peint", "Trimbakeshwar", "Deola"],
  "Nagpur": ["Nagpur", "Kamptee", "Hingna", "Katol", "Kalameshwar", "Ramtek", "Parseoni", "Mauda", "Umred", "Bhiwapur", "Kuhi", "Saoner", "Narkhed"],
  "Thane": ["Thane", "Kalyan", "Murbad", "Bhiwandi", "Shahapur", "Ulhasnagar", "Ambarnath"],
  "Mumbai City": ["Mumbai City"],
  "Mumbai Suburban": ["Kurla", "Andheri", "Borivali"],
  "Ahmednagar (Ahilyanagar)": ["Ahmednagar", "Sangamner", "Akole", "Rahata", "Shrirampur", "Nevasa", "Kopargaon", "Shevgaon", "Pathardi", "Parner", "Karjat", "Jamkhed", "Rahuri", "Shrigonda"],
  "Chhatrapati Sambhajinagar": ["Aurangabad", "Paithan", "Gangapur", "Vaijapur", "Kannad", "Khuldabad", "Sillod", "Soegaon", "Phulambri"],
  "Satara": ["Satara", "Karad", "Wai", "Mahabaleshwar", "Phaltan", "Man", "Khatav", "Koregaon", "Patan", "Jawali", "Khandala"],
  "Sangli": ["Sangli", "Miraj", "Tasgaon", "Khanapur", "Atpadi", "Kavathe Mahankal", "Jat", "Walwa", "Shirala", "Palus", "Kadegaon"],
  "Kolhapur": ["Karveer", "Panhala", "Shahuwadi", "Kagal", "Gadhinglaj", "Radhanagari", "Bhudargad", "Ajara", "Chandgad", "Hatkanangale", "Shirol", "Bawada"],
  "Solapur": ["Solapur North", "Solapur South", "Barshi", "Akkalkot", "Mohol", "Mangalwedha", "Pandharpur", "Sangola", "Madha", "Karmala", "Malshiras"],
  "Jalgaon": ["Jalgaon", "Bhusawal", "Chopda", "Erandol", "Amalner", "Pachora", "Chalisgaon", "Jamner", "Raver", "Yawal", "Parola", "Dharangaon", "Muktainagar", "Bodwad", "Bhadgaon"],
  "Raigad": ["Alibag", "Pen", "Murud", "Panvel", "Uran", "Karjat", "Khalapur", "Mangaon", "Rohag", "Tala", "Mahad", "Poladpur", "Shrivardhan", "Mhasala", "Sudhagad"],
  "Ratnagiri": ["Ratnagiri", "Sangameshwar", "Lanja", "Rajapur", "Chiplun", "Guhagar", "Dapoli", "Mandangad", "Khed"],
  "Sindhudurg": ["Kudal", "Vengurla", "Sawantwadi", "Malvan", "Kankavli", "Devgad", "Vaibhavwadi", "Dodamarg"],
  "Amravati": ["Amravati", "Bhatkuli", "Nandgaon Khandeshwar", "Chandur Railway", "Dhamangaon Railway", "Tiosa", "Morshi", "Warud", "Achalpur", "Chandurbazar", "Anjangaon Surji", "Daryapur", "Chikhaldara", "Dharni"],
  "Akola": ["Akola", "Akot", "Telhara", "Balapur", "Patur", "Murtizapur", "Barshitakli"],
  "Yavatmal": ["Yavatmal", "Babulgaon", "Kalamb", "Darwha", "Digras", "Arni", "Ner", "Pusad", "Umarkhed", "Mahagaon", "Kelapur", "Ghatanji", "Ralegaon", "Maregaon", "Zari Jamani", "Wani"],
  "Buldhana": ["Buldhana", "Chikhli", "Deulgaon Raja", "Jalgaon Jamod", "Sangrampur", "Malkapur", "Nandura", "Motaia", "Shegaon", "Khamgaon", "Mehkar", "Lonar", "Sindkhed Raja"],
  "Washim": ["Washim", "Risod", "Malegaon", "Mangrulpir", "Karanja", "Manora"],
  "Wardha": ["Wardha", "Seloo", "Arvi", "Ashti", "Karanja", "Hinganghat", "Samudrapur", "Deoli"],
  "Chandrapur": ["Chandrapur", "Bhadravati", "Warora", "Chimur", "Nagbhir", "Brahmapuri", "Sindewahi", "Mul", "Sawali", "Gondpipari", "Korpana", "Rajura", "Ballarpur", "Pombhurna", "Jiwaiti"],
  "Gadchiroli": ["Gadchiroli", "Dhanora", "Chamorshi", "Mulchera", "Desaiganj", "Armori", "Kurkheda", "Korchi", "Aheri", "Etapalli", "Bhamragad", "Sironcha"],
  "Gondia": ["Gondia", "Tirora", "Goregaon", "Arjuni Morgaon", "Deori", "Amgaon", "Salekasa", "Sadak Arjuni"],
  "Bhandara": ["Bhandara", "Tumsar", "Pauni", "Mohadi", "Sakoli", "Lakhani", "Lakhandur"],
  "Latur": ["Latur", "Udgir", "Ahmedpur", "Ausa", "Nilanga", "Chakur", "Renapur", "Deoni", "Shirur Anantpal", "Jalkot"],
  "Nanded": ["Nanded", "Ardhapur", "Mudkhed", "Bhokar", "Umri", "Loha", "Kandhar", "Kinwat", "Himayatnagar", "Hadgaon", "Biloli", "Dharmabad", "Naigaon", "Deglur", "Mukhed", "Mahur"],
  "Parbhani": ["Parbhani", "Jintur", "Sailu", "Manwath", "Pathri", "Sonpeth", "Gangakhed", "Palam", "Purna"],
  "Hingoli": ["Hingoli", "Kalamnuri", "Sengaon", "Aundha Nagnath", "Basmath"],
  "Beed": ["Beed", "Ashti", "Patoda", "Shirur Kasar", "Georai", "Majalgaon", "Wadwani", "Kaij", "Dharur", "Parli", "Ambajogai"],
  "Osmanabad (Dharashiv)": ["Osmanabad", "Tuljapur", "Omerga", "Lohara", "Kalamb", "Bhum", "Paranda", "Washi"],
  "Dhule": ["Dhule", "Sakri", "Sindkheda", "Shirpur"],
  "Nandurbar": ["Nandurbar", "Navapur", "Shahada", "Taloda", "Akkalkuwa", "Akrani"],
  "Palghar": ["Palghar", "Vasai", "Dahanu", "Talasari", "Jawhar", "Mokhada", "Wada", "Vikramgad"],
  "Nandgaon": ["Nandgaon"]
};

router.get('/list', async (req, res) => {
    const { pincode, taluka } = req.query;
    console.log(`🔍 [VILLAGE LIST] Query: Pin=${pincode}, Taluka=${taluka}`);

    // REAL PINCODE API (India Post)
    if (pincode && pincode.length === 6) {
        try {
            const apiBase = process.env.PINCODE_API_BASE || 'https://api.postalpincode.in/pincode';
            const response = await axios.get(`${apiBase}/${pincode}`);
            if (response.data && response.data[0].Status === "Success") {
                const postOffices = response.data[0].PostOffice;
                const villages = postOffices.map(po => po.Name);
                return res.json(villages);
            }
        } catch (err) {
            console.error("India Post API Error:", err.message);
        }
    }

    if (taluka && MH_DATA) {
        // Find taluka in all districts
        for (const district in MH_DATA) {
            if (MH_DATA[district].includes(taluka)) {
                // Since we don't have a full village list for every taluka offline, 
                // we return a simulation or try to search more
                return res.json([`${taluka} City`, `${taluka} Rural`, `Village 1 (${taluka})`, `Village 2 (${taluka})`]);
            }
        }
    }

    res.json(["Enter Pincode for Real List"]);
});

router.get('/districts', (req, res) => {
    res.json(Object.keys(MH_DATA));
});

router.get('/talukas', (req, res) => {
    const { district } = req.query;
    if (district && MH_DATA[district]) {
        return res.json(MH_DATA[district]);
    }
    res.json([]);
});

// DEBUG LOGGER FOR VILLAGE ROUTES
router.use((req, res, next) => {
    console.log(`🏠 [VILLAGE ROUTE] ${req.method} ${req.originalUrl || req.url}`);
    next();
});

// --- SOCIAL ACTIONS (HIGHEST PRIORITY) ---
router.post('/like/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const post = await CommunityPost.findById(id);
        if (!post) {
            // For demo posts, just return a success signal without overwriting metadata
            return res.json({ _id: id, mock: true, likes: 99 });
        }
        post.likes += 1;
        await post.save();
        res.json(post);
    } catch (err) { res.json({ _id: req.params.id, mock: true, likes: 10 }); }
});

router.post('/comment/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user, text } = req.body;
        const post = await CommunityPost.findById(id);
        if (!post) {
            // Return only the new comment array for demo posts
            return res.json({ _id: id, mock: true, comments: [{user, text, date: new Date()}] });
        }
        post.comments.push({ user, text, date: new Date() });
        await post.save();
        res.json(post);
    } catch (err) { res.json({ _id: req.params.id, mock: true }); }
});

// --- AUTH & JOIN ---
router.post('/join', async (req, res) => {
    try {
        const { village, name, role, designation } = req.body;
        const entry = new VillageStaff({
            village,
            staffId: `USER-${Math.floor(Math.random() * 100000)}`,
            pin: 'N/A',
            name,
            designation: role === 'authority' ? designation : 'Villager',
            lastLogin: new Date()
        });
        await entry.save();
        res.json({ success: true, entry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/staff/login', async (req, res) => {
    try {
        const { village, staffId, pin, name, designation } = req.body;
        if (pin !== "1234") return res.status(401).json({ error: 'Invalid PIN' });
        let staff = await VillageStaff.findOne({ village, staffId });
        if (!staff) {
            staff = new VillageStaff({ village, staffId, pin, name, designation });
            await staff.save();
        }
        res.json({ success: true, staff });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- OTHER DATA ---
router.get('/notices', async (req, res) => {
    try {
        const { village } = req.query;
        const notices = await Notice.find(village ? { village } : {}).sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/notices', async (req, res) => {
    console.log(`📢 NEW NOTICE: ${req.body.title}`);
    try {
        const notice = new Notice(req.body);
        await notice.save();
        res.json(notice);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/notices/:id', async (req, res) => {
    console.log(`🗑️ DELETE NOTICE (Plural): ${req.params.id}`);
    try {
        const { id } = req.params;
        await Notice.deleteOne({ _id: id });
        res.json({ success: true, id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/notice/:id', async (req, res) => {
    console.log(`🗑️ DELETE NOTICE (Singular): ${req.params.id}`);
    try {
        const { id } = req.params;
        await Notice.deleteOne({ _id: id });
        res.json({ success: true, id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/posts', async (req, res) => {
    try {
        const { village } = req.query;
        const posts = await CommunityPost.find(village ? { village } : {}).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/posts', async (req, res) => {
    try {
        const post = new CommunityPost(req.body);
        await post.save();
        res.json(post);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/applications', async (req, res) => {
    try {
        const { village, user } = req.query;
        let query = {};
        if (village) query.village = village;
        if (user) query.user = user;
        const apps = await Application.find(query).sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/applications', async (req, res) => {
    try {
        const app = new Application(req.body);
        await app.save();
        res.json(app);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/applications/:id', async (req, res) => {
    try {
        const app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(app);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/grievances', async (req, res) => {
    try {
        const { village } = req.query;
        const list = await Grievance.find(village ? { village } : {}).sort({ createdAt: -1 });
        res.json(list);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/grievances', async (req, res) => {
    try {
        const g = new Grievance(req.body);
        await g.save();
        res.json(g);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
