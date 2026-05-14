const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    village: { type: String, required: true },
    user: { type: String, required: true }, // Applicant Name
    type: { type: String, required: true }, // e.g. 'Water Connection'
    aadhaar: { type: String },
    reason: { type: String },
    status: { type: String, default: 'pending' },
    date: { type: String, default: () => new Date().toLocaleDateString('en-GB') },
    createdAt: { type: Date, default: Date.now }
});

module.exports = ApplicationSchema;
