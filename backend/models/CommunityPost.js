const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
    village: { type: String, required: true },
    user: { type: String, required: true }, // User Name
    msg: { type: String, required: true },
    tag: { type: String, default: 'update' }, // 'sell', 'help', 'update'
    image: { type: String },
    likes: { type: Number, default: 0 },
    comments: [{ user: String, text: String, date: { type: Date, default: Date.now } }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = CommunityPostSchema;
