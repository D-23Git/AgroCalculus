const mongoose = require('mongoose');

const GrievanceSchema = new mongoose.Schema({
    village: { type: String, required: true },
    user: { type: String, required: true }, // Applicant Name
    type: { type: String },
    ward: { type: String },
    msg: { type: String, required: true },
    phone: { type: String },
    photo: { type: String },
    status: { type: String, default: 'pending' },
    adminNote: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = GrievanceSchema;
