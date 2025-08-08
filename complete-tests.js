// Run with: node complete-tests.js
const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('Running Skill Swap API Tests\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`${test.name}`);
        console.log(`   Error: ${error.message}`);
        this.failed++;
      }
    }
    
    const total = this.passed + this.failed;
    const percentage = Math.round((this.passed / total) * 100);
    
    console.log(`\nTest Results:`);
    console.log(`Passed: ${this.passed}/${total} (${percentage}%)`);
    console.log(`Failed: ${this.failed}`);
    
    if (this.failed === 0) {
      console.log('\n All tests passed!');
    } else {
      console.log('\n Some tests failed.');
    }
  }
}
// Validation logic 
function validateRegistration(userData) {
  const { name, email, password } = userData;
  
  if (!name || !email || !password) {
    throw new Error('Please fill in all fields');
  }
  
  if (email.indexOf('@') === -1) {
    throw new Error('Invalid email format');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  return true;
}

// Coordinate validation 
function validateCoordinates(latitude, longitude) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return false;
  }
  
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return false;
  }
  
  return { lat, lng };
}

// Distance preference validation 
function validateDistancePreferences(useDistanceMatching, maxMatchDistance) {
  if (maxMatchDistance !== undefined) {
    const distance = Number(maxMatchDistance);
    if (!Number.isFinite(distance) || distance < 1 || distance > 10000) {
      throw new Error('Distance must be between 1 and 10,000 kilometers');
    }
  }
  
  return {
    useDistanceMatching: Boolean(useDistanceMatching),
    maxMatchDistance: Number(maxMatchDistance) || 50
  };
}

// Password hashing 
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Password verification 
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// JWT token creation 
function createToken(userId) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' });
}

// JWT token verification 
function verifyToken(authHeader) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token, authorization denied');
  }

  const token = authHeader.split(' ')[1];
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Token not valid');
  }
}

runner.run().catch(console.error);