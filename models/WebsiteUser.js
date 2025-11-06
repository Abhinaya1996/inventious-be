const mongoose = require('mongoose');

const websiteUserSchema = new mongoose.Schema({
  brandName: { type: String, required: true },
  tagline: { type: String },
  logo: { type: String },
  differentiator: { type: String },
  targetAudience: { type: String },
  location: { type: String },
  tone: { type: String },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('WebsiteUser', websiteUserSchema);
