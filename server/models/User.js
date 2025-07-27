const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skillsOffered: [{ type: String }],
  skillsWanted: [{ type: String }],
  skillEmbeddings: [{
    skill: { type: String, required: true },
    embedding: { type: [Number], required: true }
  }],
  embedding: { type: [Number], default: [] }, 
  //  location field for geospatial matching
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], 
      index: '2dsphere'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
