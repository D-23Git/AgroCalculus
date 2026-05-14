const mongoose = require('mongoose');

const MandiLogSchema = new mongoose.Schema({
    mandiId: { type: String, required: true },
    vehicleNo: { type: String, required: true },
    driver: { type: String, required: true },
    type: { type: String, required: true },
    crop: { type: String },
    weight: { type: String },
    status: { type: String, default: 'inside' },
    payStatus: { type: String, default: 'paid' },
    fee: { type: String, default: '₹50.00' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    inTime: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = MandiLogSchema;
