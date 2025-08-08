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

// Skill parsing logic 
function parseSkills(skillString) {
  if (!skillString) return [];
  
  return skillString
    .split(',')
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);
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

// Matching logic 
function findSkillMatches(currentUser, candidateUsers) {
  const matches = {
    usersWantingMySkills: [],
    usersOfferingWhatINeed: [],
    mutualMatches: []
  };
  
  for (const user of candidateUsers) {
    if (user.id === currentUser.id) continue;
    
    // Check if they want my skills
    const wantsMySkills = user.skillsWanted.some(wanted => 
      currentUser.skillsOffered.some(offered => 
        offered.toLowerCase() === wanted.toLowerCase()
      )
    );
    
    // Check if they offer what I need
    const offersWhatINeed = user.skillsOffered.some(offered => 
      currentUser.skillsWanted.some(wanted => 
        wanted.toLowerCase() === offered.toLowerCase()
      )
    );
    
    if (wantsMySkills) matches.usersWantingMySkills.push(user);
    if (offersWhatINeed) matches.usersOfferingWhatINeed.push(user);
    if (wantsMySkills && offersWhatINeed) matches.mutualMatches.push(user);
  }
  
  return matches;
}

// UNIT TESTS

const runner = new TestRunner();

// Test Group 1: User Registration Validation
runner.test('User registration - valid data should pass', async () => {
  const validUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  };
  
  const result = validateRegistration(validUser);
  assert.strictEqual(result, true);
});

runner.test('User registration - missing name should fail', async () => {
  const invalidUser = {
    email: 'john@example.com',
    password: 'password123'
  };
  
  try {
    validateRegistration(invalidUser);
    throw new Error('Should have failed');
  } catch (error) {
    assert.strictEqual(error.message, 'Please fill in all fields');
  }
});

runner.test('User registration - invalid email should fail', async () => {
  const invalidUser = {
    name: 'John Doe',
    email: 'invalid-email',
    password: 'password123'
  };
  
  try {
    validateRegistration(invalidUser);
    throw new Error('Should have failed');
  } catch (error) {
    assert.strictEqual(error.message, 'Invalid email format');
  }
});

runner.test('User registration - short password should fail', async () => {
  const invalidUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: '123'
  };
  
  try {
    validateRegistration(invalidUser);
    throw new Error('Should have failed');
  } catch (error) {
    assert.strictEqual(error.message, 'Password must be at least 6 characters');
  }
});

// Test Group 2: Skill Parsing
runner.test('Skill parsing - comma separated skills should work', async () => {
  const skillString = 'JavaScript, React, Node.js, Python';
  const skills = parseSkills(skillString);
  
  assert.deepStrictEqual(skills, ['JavaScript', 'React', 'Node.js', 'Python']);
});

runner.test('Skill parsing - empty skills should return empty array', async () => {
  const skills1 = parseSkills('');
  const skills2 = parseSkills(null);
  const skills3 = parseSkills(undefined);
  
  assert.deepStrictEqual(skills1, []);
  assert.deepStrictEqual(skills2, []);
  assert.deepStrictEqual(skills3, []);
});

runner.test('Skill parsing - should filter empty entries', async () => {
  const skillString = 'JavaScript, , React, , Node.js, ';
  const skills = parseSkills(skillString);
  
  assert.deepStrictEqual(skills, ['JavaScript', 'React', 'Node.js']);
});

// Test Group 3: Location Validation
runner.test('Location validation - valid coordinates should pass', async () => {
  const result = validateCoordinates(40.7128, -74.0060);
  assert.deepStrictEqual(result, { lat: 40.7128, lng: -74.0060 });
});

runner.test('Location validation - invalid coordinates should fail', async () => {
  const result1 = validateCoordinates(200, -74.0060); // Invalid lat
  const result2 = validateCoordinates(40.7128, -300); // Invalid lng
  const result3 = validateCoordinates('invalid', 'coords'); // Non-numeric
  
  assert.strictEqual(result1, false);
  assert.strictEqual(result2, false);
  assert.strictEqual(result3, false);
});

// Test Group 4: Distance Preferences
runner.test('Distance preferences - valid settings should work', async () => {
  const result = validateDistancePreferences(true, 100);
  assert.deepStrictEqual(result, { useDistanceMatching: true, maxMatchDistance: 100 });
});

runner.test('Distance preferences - invalid distance should fail', async () => {
  try {
    validateDistancePreferences(true, 15000); // Too high
    throw new Error('Should have failed');
  } catch (error) {
    assert.strictEqual(error.message, 'Distance must be between 1 and 10,000 kilometers');
  }
});

// Test Group 5: Password Security
runner.test('Password hashing - should create different hashes', async () => {
  const password = 'password123';
  const hash1 = await hashPassword(password);
  const hash2 = await hashPassword(password);
  
  assert.notStrictEqual(hash1, hash2); 
  assert(hash1.length > 20); 
});

runner.test('Password verification - should verify correct password', async () => {
  const password = 'password123';
  const hash = await hashPassword(password);
  const isValid = await verifyPassword(password, hash);
  
  assert.strictEqual(isValid, true);
});

runner.test('Password verification - should reject incorrect password', async () => {
  const password = 'password123';
  const wrongPassword = 'wrongpassword';
  const hash = await hashPassword(password);
  const isValid = await verifyPassword(wrongPassword, hash);
  
  assert.strictEqual(isValid, false);
});

// Test Group 6: JWT Tokens
runner.test('JWT token - should create valid token', async () => {
  const userId = 'user123';
  const token = createToken(userId);
  
  assert(typeof token === 'string');
  assert(token.length > 20);
});

runner.test('JWT token - should verify valid token', async () => {
  const userId = 'user123';
  const token = createToken(userId);
  const authHeader = `Bearer ${token}`;
  
  const decoded = verifyToken(authHeader);
  assert.strictEqual(decoded.id, userId);
});

runner.test('JWT token - should reject invalid token', async () => {
  try {
    verifyToken('Bearer invalidtoken');
    throw new Error('Should have failed');
  } catch (error) {
    assert.strictEqual(error.message, 'Token not valid');
  }
});

// Test Group 7: Skill Matching Logic
runner.test('Skill matching - should find mutual matches', async () => {
  const currentUser = {
    id: '1',
    skillsOffered: ['JavaScript', 'React'],
    skillsWanted: ['Python', 'Django']
  };
  
  const candidates = [
    {
      id: '2',
      skillsOffered: ['Python', 'Flask'],
      skillsWanted: ['JavaScript']
    }
  ];
  
  const matches = findSkillMatches(currentUser, candidates);
  
  assert.strictEqual(matches.usersWantingMySkills.length, 1);
  assert.strictEqual(matches.usersOfferingWhatINeed.length, 1);
  assert.strictEqual(matches.mutualMatches.length, 1);
});

runner.test('Skill matching - should handle no matches', async () => {
  const currentUser = {
    id: '1',
    skillsOffered: ['JavaScript'],
    skillsWanted: ['Python']
  };
  
  const candidates = [
    {
      id: '2',
      skillsOffered: ['Java'],
      skillsWanted: ['C++']
    }
  ];
  
  const matches = findSkillMatches(currentUser, candidates);
  
  assert.strictEqual(matches.usersWantingMySkills.length, 0);
  assert.strictEqual(matches.usersOfferingWhatINeed.length, 0);
  assert.strictEqual(matches.mutualMatches.length, 0);
});


runner.run().catch(console.error);