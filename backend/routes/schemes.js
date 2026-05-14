const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('dotenv').config();

const SchemeSchema = require('../models/scheme');

// ISOLATED DATABASE CONNECTION
const schemeConn = mongoose.createConnection(process.env.MONGO_URI, { 
    dbName: 'schemes_db'
});

schemeConn.on('connected', () => console.log('✅ SchemesDB Connected: REMOTE (Atlas)'));

const Scheme = schemeConn.model('Scheme', SchemeSchema);

// Application Log Schema
const SchemeApplicationSchema = new mongoose.Schema({
    schemeId: Number,
    schemeName: String,
    user: String,
    village: String,
    appliedAt: { type: Date, default: Date.now }
});
const SchemeApplication = schemeConn.model('SchemeApplication', SchemeApplicationSchema);

// ROUTES
router.get('/', async (req, res) => {
    try {
        const schemes = await Scheme.find().sort({ popular: -1, trending: -1 });
        res.json(schemes);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch schemes' });
    }
});

router.post('/apply', async (req, res) => {
    try {
        const { schemeId, schemeName, user, village } = req.body;
        const refId = "MH" + Math.floor(100000 + Math.random() * 900000);
        const newApp = new SchemeApplication({ 
            schemeId, 
            schemeName, 
            user, 
            village, 
            refId, 
            status: 'Pending' 
        });
        await newApp.save();
        res.json({ success: true, refId, status: 'Pending' });
    } catch (e) {
        res.status(500).json({ error: 'Application failed' });
    }
});

router.get('/status/:refId', async (req, res) => {
    try {
        const app = await SchemeApplication.findOne({ refId: req.params.refId });
        if (app) {
            res.json(app);
        } else {
            res.status(404).json({ error: 'Application not found' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Status check failed' });
    }
});

// Admin Route to Seed Data (One-time use)
router.post('/seed', async (req, res) => {
    try {
        const { schemes } = req.body;
        await Scheme.deleteMany({});
        const inserted = await Scheme.insertMany(schemes);
        res.json({ success: true, count: inserted.length });
    } catch (e) {
        res.status(500).json({ error: 'Seeding failed', details: e.message });
    }
});

module.exports = router;
