const mongoose = require('mongoose');

const VillageStaffSchema = new mongoose.Schema({
    village: { type: String, required: true },
    staffId: { type: String, required: true },
    pin: { type: String, required: true },
    name: { type: String, required: true },
    designation: { type: String },
    lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound unique index for staffId per village
VillageStaffSchema.index({ village: 1, staffId: 1 }, { unique: true });

module.exports = VillageStaffSchema;
