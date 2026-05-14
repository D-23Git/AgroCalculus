const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('dotenv').config();

const NewsSchema = require('../models/news');

// Use the Schemes connection or a new one? Let's use schemes_db for all scheme-related info
const newsConn = mongoose.createConnection(process.env.MONGO_URI, { 
    dbName: 'schemes_db'
});

newsConn.on('connected', () => console.log('✅ NewsDB Connected: REMOTE (Atlas)'));

const News = newsConn.model('News', NewsSchema);

// GET ACTIVE NEWS
router.get('/', async (req, res) => {
    try {
        const news = await News.find({ active: true }).sort({ createdAt: -1 });
        res.json(news);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// ADMIN SEED NEWS
router.post('/seed', async (req, res) => {
    try {
        const initialNews = [
            { title: { en: "Namo Shetkari 4th installment to be credited soon!", mr: "नमो शेतकरी सन्मान योजनेचा चौथा हप्ता लवकरच जमा होणार!" } },
            { title: { en: "New registrations for PM KUSUM are now open.", mr: "पीएम कुसुम योजनेसाठी नवीन अर्ज नोंदणी सुरू झाली आहे." } },
            { title: { en: "Bhavantar scheme benefits announced for Soybean growers.", mr: "सोयाबीन उत्पादकांसाठी भावांतर योजनेचा लाभ जाहीर." } }
        ];
        await News.deleteMany({});
        const inserted = await News.insertMany(initialNews);
        res.json({ success: true, count: inserted.length });
    } catch (e) {
        res.status(500).json({ error: 'Seeding news failed' });
    }
});

module.exports = router;
