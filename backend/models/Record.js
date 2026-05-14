const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    fieldId: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    note: { type: String },
    receipt: { type: String },
    buyer: { type: String },
    incomeType: { type: String },
    details: { type: Object },
    createdAt: { type: Date, default: Date.now }
});

module.exports = RecordSchema;
