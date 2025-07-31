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

  // Location field for geospatial matching
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    }
  },

  // Distance-based matching preferences
  useDistanceMatching: { 
    type: Boolean, 
    default: false 
  },
  maxMatchDistance: { 
    type: Number, 
    default: 50, // in kilometers
    min: 1,
    max: 10000 // reasonable max of 10,000km
  }
}, { timestamps: true });

// Add 2dsphere index to enable geospatial querying
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);