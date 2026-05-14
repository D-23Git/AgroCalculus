const express = require('express');
const auth = require('../middleware/auth');
const { ledgerConn } = require('../db');
const FieldSchema = require('../models/Field');
const router = express.Router();

const Field = ledgerConn.model('Field', FieldSchema);

router.get('/', auth, async (req, res) => {
    try {
        const fields = await Field.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(fields);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const newField = new Field({ ...req.body, user: req.user.id });
        const field = await newField.save();
        res.json(field);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const field = await Field.findById(req.params.id);
        if (!field || field.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
        await field.deleteOne();
        res.json({ msg: 'Field removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
