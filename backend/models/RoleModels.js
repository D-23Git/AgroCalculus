const mongoose = require('mongoose');

// Admin Schema
const AdminSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'Admin' },
    email: String,
    lastLogin: { type: Date, default: Date.now }
});

// Officer Schema
const OfficerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    staffId: String,
    mandiId: String,
    lastLogin: { type: Date, default: Date.now }
});

module.exports = { AdminSchema, OfficerSchema };
