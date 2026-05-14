const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
    village: { type: String, required: true }, // Village name or ID
    title: { type: String, required: true },
    msg: { type: String, required: true },
    type: { type: String, default: 'info' },
    official: { type: String }, // Designation
    officialName: { type: String },
    date: { type: String, default: () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) },
    createdAt: { type: Date, default: Date.now }
});

module.exports = NoticeSchema;
