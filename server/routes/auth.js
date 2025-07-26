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

    const { name, email, password, skillsOffered, skillsWanted } = req.body;

    if (!name || !email || !password) {
      console.log("Missing fields");
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
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


    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      skillsOffered: offered,
      skillsWanted: wanted,
      skillEmbeddings
    });

    await newUser.save();
    console.log("User registered:", newUser.email);

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
    // Testing
    console.log("/match route hit");
    console.log(" ncoming auth header:", req.headers.authorization);
    console.log("User:", currentUser.email);

    const allUsers = await User.find({
      _id: { $ne: currentUser._id },
      skillEmbeddings: { $exists: true, $ne: [] },
    });

    const cosineSimilarity = (vecA, vecB) => {
      const dot = vecA.reduce((sum, v, i) => sum + v * vecB[i], 0);
      const magA = Math.sqrt(vecA.reduce((sum, v) => sum + v * v, 0));
      const magB = Math.sqrt(vecB.reduce((sum, v) => sum + v * v, 0));
      return dot / (magA * magB);
    };

    const SIM_THRESHOLD = 0.65;

    const usersWantingMySkills = [];
    const usersOfferingWhatINeed = [];
    const mutualMatches = [];

    for (const user of allUsers) {
      let wantsMySkill = false;
      let offersWhatINeed = false;

      // Check if this user wants my offered skills
      for (const mySkill of currentUser.skillEmbeddings.filter(s => currentUser.skillsOffered.includes(s.skill))) {
        for (const theirWanted of user.skillEmbeddings.filter(s => user.skillsWanted.includes(s.skill))) {
          const sim = cosineSimilarity(mySkill.embedding, theirWanted.embedding);
          console.log(`🧪 ${user.email} wants ${theirWanted.skill} — sim with my offered ${mySkill.skill}: ${sim.toFixed(3)}`);
          if (sim >= SIM_THRESHOLD) {
            wantsMySkill = true;
            break;
          }
        }
        if (wantsMySkill) break;
      }

      // Check if this user offers what I want
      for (const theirSkill of user.skillEmbeddings.filter(s => user.skillsOffered.includes(s.skill))) {
        for (const myWanted of currentUser.skillEmbeddings.filter(s => currentUser.skillsWanted.includes(s.skill))) {
          const sim = cosineSimilarity(theirSkill.embedding, myWanted.embedding);
          console.log(`🧪 ${user.email} offers ${theirSkill.skill} — sim with my wanted ${myWanted.skill}: ${sim.toFixed(3)}`);
          if (sim >= SIM_THRESHOLD) {
            offersWhatINeed = true;
            break;
          }
        }
        if (offersWhatINeed) break;
      }

      // Save in separate lists
      if (wantsMySkill) usersWantingMySkills.push(user);
      if (offersWhatINeed) usersOfferingWhatINeed.push(user);
      if (wantsMySkill && offersWhatINeed) mutualMatches.push(user);
    }

    console.log("Users wanting my skills:", usersWantingMySkills.map(u => u.email));
    console.log("Users offering what I need:", usersOfferingWhatINeed.map(u => u.email));
    console.log("Mutual matches:", mutualMatches.map(u => u.email));

    res.json({
      usersWantingMySkills,
      usersOfferingWhatINeed,
      mutualMatches
    });
  } catch (err) {
    console.error("Match error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
