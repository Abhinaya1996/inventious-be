const mongoose = require('mongoose');

const WebsiteImageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebsiteUser',
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

module.exports = mongoose.model('WebsiteImage', WebsiteImageSchema);
