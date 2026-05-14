const mongoose = require('mongoose');

const MandiPriceSchema = new mongoose.Schema({
    mandiId: { type: String, required: true },
    cropId: { type: String, required: true },
    modal: { type: Number, required: true },
    min: { type: Number },
    max: { type: Number },
    arrival: { type: Number },
    unit: { type: String, default: 'Quintal' },
    date: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = MandiPriceSchema;
