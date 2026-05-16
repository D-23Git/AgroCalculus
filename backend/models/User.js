const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    mobile: { type: String, unique: true, sparse: true },
    password: { type: String },
    otp: { type: String },
    village: { type: String },
    district: { type: String },
    acres: { type: String },
    // Role & Account Type
    role: { type: String, default: 'farmer' },         // 'farmer' | 'officer' | 'superadmin'
    accountType: { type: String, default: 'farmer' },   // visible label in analytics
    // APMC Officer specific
    mandiId: { type: String },                          // e.g. 'pune_shirur_main'
    officerDistrict: { type: String },
    officerTaluka: { type: String },
    staffId: { type: String },
    // Meta
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = UserSchema; // Export Schema instead of Model
