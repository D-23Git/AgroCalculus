const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    en: String,
    mr: String
  },
  type: { type: String, default: 'scheme' }, // 'scheme', 'mandi', 'weather'
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = NewsSchema;
