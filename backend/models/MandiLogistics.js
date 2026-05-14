const mongoose = require('mongoose');

const MandiLogisticsSchema = new mongoose.Schema({
    mandiId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driverName: { type: String, required: true },
    vehicleNo: { type: String, required: true },
    cropName: { type: String, required: true },
    quantity: { type: String, required: true },
    contact: { type: String, required: true },
    status: { type: String, default: 'Pending' }, // Pending, Approved, Rejected
    createdAt: { type: Date, default: Date.now }
});

module.exports = MandiLogisticsSchema;
