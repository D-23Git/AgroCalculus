const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    crop: { type: String, required: true },
    area: { type: Number, required: true },
    plantDate: { type: String },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = FieldSchema;
