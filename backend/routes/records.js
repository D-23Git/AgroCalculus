const express = require('express');
const auth = require('../middleware/auth');
const { ledgerConn } = require('../db');
const RecordSchema = require('../models/Record');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const Record = ledgerConn.model('Record', RecordSchema);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/upload', auth, upload.single('receipt'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ filename: req.file.filename, url: `/uploads/${req.file.filename}` });
});

router.get('/', auth, async (req, res) => {
    try {
        const records = await Record.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const newRecord = new Record({ ...req.body, user: req.user.id });
        const record = await newRecord.save();
        res.json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id', auth, async (req, res) => {
    try {
        let record = await Record.findById(req.params.id);
        if (!record || record.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
        record = await Record.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        if (!record || record.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
        await record.deleteOne();
        res.json({ msg: 'Record removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
