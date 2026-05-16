const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    role: String,
    accountType: String,
    timestamp: { type: Date, default: Date.now },
    ip: String,
    userAgent: String
});

module.exports = LoginLogSchema;
