const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    mobile: { type: String, unique: true, sparse: true },
    password: { type: String },
    otp: { type: String },
    village: { type: String },
    district: { type: String },
    role: { type: String, default: 'farmer' },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = UserSchema; // Export Schema instead of Model
