const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { getEmbedding } = require('../utils/embeddings');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log("Received registration request");
    console.log("Request body:", req.body);

    const { name, email, password, skillsOffered, skillsWanted, latitude, longitude, useDistanceMatching, maxMatchDistance } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const offered = Array.isArray(skillsOffered)
      ? skillsOffered
      : (skillsOffered || "").split(',').map(s => s.trim()).filter(Boolean);

    const wanted = Array.isArray(skillsWanted)
      ? skillsWanted
      : (skillsWanted || "").split(',').map(s => s.trim()).filter(Boolean);

    const allSkills = [...offered, ...wanted].map(s => s.trim().toLowerCase());

    const skillEmbeddings = [];
    for (const skill of allSkills) {
      const embedding = await getEmbedding(skill);
      skillEmbeddings.push({ skill, embedding });
    }

  
    const newUserData = {
      name,
      email,
      password: hashedPassword,
      skillsOffered: offered,
      skillsWanted: wanted,
      skillEmbeddings,
      useDistanceMatching: useDistanceMatching || false,
      maxMatchDistance: maxMatchDistance || 50,
    };

    // Only add location if we have valid coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng) && 
        lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      newUserData.location = {
        type: "Point",
        coordinates: [lng, lat]
      };
    }

    const newUser = new User(newUserData);
    await newUser.save();
    console.log("User saved successfully:", newUser._id);

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        skillsOffered: newUser.skillsOffered,
        skillsWanted: newUser.skillsWanted
      }
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add skill route
router.post('/add-skill', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (skill && !user.skillsOffered.includes(skill)) {
      user.skillsOffered.push(skill);
      await user.save();
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove skill route
router.post("/remove-skill", authMiddleware, async (req, res) => {
  const { skill } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.skillsOffered = user.skillsOffered.filter(
      (s) => s.toLowerCase() !== skill.toLowerCase()
    );

    await user.save();
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Match route — compares offered/wanted skill embeddings semantically
router.get('/match', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || !currentUser.skillEmbeddings?.length) {
       return res.status(404).json({ message: "User or their embeddings not found" });
    }

    let candidateUsers = [];

    // Check if user wants distance-based matching
    if (currentUser.useDistanceMatching) {
      // User wants distance matching - check if they have valid location
      if (currentUser.location?.coordinates?.length === 2) {
        const [lng, lat] = currentUser.location.coordinates;
        
        // Validate coordinates are valid numbers
        if (Number.isFinite(lng) && Number.isFinite(lat) && 
            lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
          
          // Convert km to meters for MongoDB query
          const maxDistanceInMeters = currentUser.maxMatchDistance * 1000;
          
          candidateUsers = await User.find({
            _id: { $ne: currentUser._id },
            skillEmbeddings: { $exists: true, $ne: [] },
            location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: [lng, lat]
                },
                $maxDistance: maxDistanceInMeters
              }
            }
          });
        } else {
          // Invalid coordinates but user wants distance matching
          return res.json({
            usersWantingMySkills: [],
            usersOfferingWhatINeed: [],
            mutualMatches: [],
            message: "Invalid location coordinates. Please update your location to use distance-based matching.",
            matchingType: "distance_error"
          });
        }
      } else {
        // No location data but user wants distance matching
        return res.json({
          usersWantingMySkills: [],
          usersOfferingWhatINeed: [],
          mutualMatches: [],
          message: "Location required for distance-based matching. Please enable location sharing.",
          matchingType: "distance_no_location"
        });
      }
    } else {
      // User doesn't want distance matching - search globally
      candidateUsers = await User.find({
        _id: { $ne: currentUser._id },
        skillEmbeddings: { $exists: true, $ne: [] },
      });
    }

    // Helper function for cosine similarity
    const cosineSimilarity = (vecA, vecB) => {
      if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
      
      const dot = vecA.reduce((sum, v, i) => sum + v * vecB[i], 0);
      const magA = Math.sqrt(vecA.reduce((sum, v) => sum + v * v, 0));
      const magB = Math.sqrt(vecB.reduce((sum, v) => sum + v * v, 0));
      
      if (magA === 0 || magB === 0) return 0;
      return dot / (magA * magB);
    };

    const SIM_THRESHOLD = 0.4;
    const usersWantingMySkills = [];
    const usersOfferingWhatINeed = [];
    const mutualMatches = [];

    // Process candidate users only if current user has embeddings
    if (currentUser.skillEmbeddings?.length > 0) {
      for (const user of candidateUsers) {
        let wantsMySkill = false;
        let offersWhatINeed = false;

        // Check if they want my offered skills
        for (const mySkill of currentUser.skillEmbeddings.filter(s => 
          currentUser.skillsOffered.includes(s.skill))) {
          for (const theirWanted of user.skillEmbeddings.filter(s => 
            user.skillsWanted.includes(s.skill))) {
            const sim = cosineSimilarity(mySkill.embedding, theirWanted.embedding);
            if (sim >= SIM_THRESHOLD) {
              wantsMySkill = true;
              break;
            }
          }
          if (wantsMySkill) break;
        }

        // Check if they offer what I need
        for (const theirSkill of user.skillEmbeddings.filter(s => 
          user.skillsOffered.includes(s.skill))) {
          for (const myWanted of currentUser.skillEmbeddings.filter(s => 
            currentUser.skillsWanted.includes(s.skill))) {
            const sim = cosineSimilarity(theirSkill.embedding, myWanted.embedding);
            if (sim >= SIM_THRESHOLD) {
              offersWhatINeed = true;
              break;
            }
          }
          if (offersWhatINeed) break;
        }

        if (wantsMySkill) usersWantingMySkills.push(user);
        if (offersWhatINeed) usersOfferingWhatINeed.push(user);
        if (wantsMySkill && offersWhatINeed) mutualMatches.push(user);
      }
    }

    res.json({
      usersWantingMySkills,
      usersOfferingWhatINeed,
      mutualMatches,
      totalCandidates: candidateUsers.length,
      matchingType: currentUser.useDistanceMatching ? "distance" : "global",
      maxDistance: currentUser.useDistanceMatching ? currentUser.maxMatchDistance : null
    });

  } catch (err) {
    console.error("Match error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update distance matching preferences
router.post('/update-distance-preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { useDistanceMatching, maxMatchDistance } = req.body;

    // Validate maxMatchDistance
    if (maxMatchDistance !== undefined) {
      const distance = Number(maxMatchDistance);
      if (!Number.isFinite(distance) || distance < 1 || distance > 10000) {
        return res.status(400).json({ 
          message: 'Distance must be between 1 and 10,000 kilometers' 
        });
      }
    }

    const updateData = {};
    if (typeof useDistanceMatching === 'boolean') {
      updateData.useDistanceMatching = useDistanceMatching;
    }
    if (maxMatchDistance !== undefined) {
      updateData.maxMatchDistance = Number(maxMatchDistance);
    }

    const user = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Distance preferences updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        useDistanceMatching: user.useDistanceMatching,
        maxMatchDistance: user.maxMatchDistance,
        hasLocation: !!(user.location?.coordinates?.length === 2)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile with distance preferences
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        useDistanceMatching: user.useDistanceMatching,
        maxMatchDistance: user.maxMatchDistance,
        hasLocation: !!(user.location?.coordinates?.length === 2),
        location: user.location
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user location
router.post('/update-location', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude } = req.body;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
        lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ 
        message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.' 
      });
    }

    const location = {
      type: "Point",
      coordinates: [lng, lat]
    };

    const user = await User.findByIdAndUpdate(
      userId, 
      { location }, 
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Location updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasLocation: true,
        useDistanceMatching: user.useDistanceMatching,
        maxMatchDistance: user.maxMatchDistance
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
