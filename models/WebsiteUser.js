const mongoose = require('mongoose');

const websiteUserSchema = new mongoose.Schema({
  // Registration Fields
  fullName: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // sparse prevents duplicate null errors
  phone: { type: String },
  password: { type: String, required: true },

  // Use email prefix or phone as system username
  username: { type: String, unique: true, required: true },

  // Onboarding Fields (not required at registration)
  category: { type: String, default: null },
  subCategory: { type: String, default: null },

  brandName: { type: String, default: null },
  businessName: { type: String, default: null },

  businessEmail: { type: String, default: null },
  businessPhone: { type: String, default: null },

  tagline: { type: String, default: null },
  targetAudience: { type: String, default: null },
  location: { type: String, default: null },

  logo: { type: String, default: null },
  tone: { type: String, default: null },   // mood / tone preference
  platform: { type: String, default: null }, // Facebook / Instagram / LinkedIn etc.
}, { timestamps: true });

module.exports = mongoose.model('WebsiteUser', websiteUserSchema);
