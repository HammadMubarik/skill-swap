const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { getEmbeddingFromOpenAI } = require('../utils/openai'); 
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

    const combined = [...offered, ...wanted].join(', ');
    const embedding = await getEmbeddingFromOpenAI(combined); // NEW: generate embedding

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      skillsOffered: offered,
      skillsWanted: wanted,
      embedding 
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

// Match route — returns users that match
router.get('/match', authMiddleware, async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  if (!currentUser) return res.status(404).json({ message: "User not found" });

  const usersWantingMySkills = await User.find({
    _id: { $ne: currentUser._id },
    skillsWanted: { $in: currentUser.skillsOffered },
  });

  const usersOfferingWhatINeed = await User.find({
    _id: { $ne: currentUser._id },
    skillsOffered: { $in: currentUser.skillsWanted },
  });

  res.json({ usersWantingMySkills, usersOfferingWhatINeed });
});

module.exports = router;
