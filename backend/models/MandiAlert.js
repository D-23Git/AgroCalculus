const mongoose = require('mongoose');

const MandiAlertSchema = new mongoose.Schema({
    mandiId: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, default: 'info' }, // info, warning, success
    ts: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    createdAt: { type: Date, default: Date.now }
});

module.exports = MandiAlertSchema;
