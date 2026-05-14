const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  icon: String,
  category: {
    en: String,
    mr: String
  },
  name: {
    en: String,
    mr: String
  },
  benefit: {
    en: String,
    mr: String
  },
  eligibility: {
    en: String,
    mr: String
  },
  desc: {
    en: String,
    mr: String
  },
  docs: {
    en: [String],
    mr: [String]
  },
  link: String,
  color: String,
  status: {
    en: String,
    mr: String
  },
  popular: { type: Boolean, default: false },
  trending: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = SchemeSchema;
