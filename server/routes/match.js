const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.get('/match', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const { skillsOffered, skillsWanted } = currentUser;

    // 1. Find users who want your skills
    const usersWantingMySkills = await User.find({
      _id: { $ne: currentUser._id },
      skillsWanted: { $in: skillsOffered },
    }).select('name email skillsOffered skillsWanted');

    // 2. Find users who offer what you want
    const usersOfferingWhatINeed = await User.find({
      _id: { $ne: currentUser._id },
      skillsOffered: { $in: skillsWanted },
    }).select('name email skillsOffered skillsWanted');

    res.json({
      usersWantingMySkills,
      usersOfferingWhatINeed,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
