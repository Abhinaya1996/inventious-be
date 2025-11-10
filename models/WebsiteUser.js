const mongoose = require('mongoose');

const websiteUserSchema = new mongoose.Schema({
  fullName: { type: String },
  email: { type: String, unique: true },
  phone: { type: String },
  password: { type: String },
  username: { type: String },

  brandName: { type: String },
  businessName: { type: String },
  businessEmail: { type: String },
  businessPhone: { type: String },

  tagline: { type: String },
  differentiator: { type: String }, // ✅ ADDED
  targetAudience: { type: String },
  location: { type: String },
  tone: { type: String },
  platform: { type: String },

  category: { type: String },
  subCategory: { type: String },
  logo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteUser', websiteUserSchema);
