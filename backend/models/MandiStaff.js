const mongoose = require('mongoose');

const MandiStaffSchema = new mongoose.Schema({
    staffId: { type: String, required: true }, // e.g. APMC001
    pin: { type: String, required: true },
    name: { type: String, required: true },
    mandiId: { type: String, required: true }, // Which mandi they belong to
    role: { type: String, default: 'staff' },
    lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure uniqueness per market
MandiStaffSchema.index({ staffId: 1, mandiId: 1 }, { unique: true });

module.exports = MandiStaffSchema;
