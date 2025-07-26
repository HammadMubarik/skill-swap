const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skillsOffered: [{ type: String }],
  skillsWanted: [{ type: String }],
  // Add the skillEmbeddings field that your code expects
  skillEmbeddings: [{
    skill: { type: String, required: true },
    embedding: { type: [Number], required: true }
  }],
  // Keep the old embedding field for backward compatibility (optional)
  embedding: { type: [Number], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
