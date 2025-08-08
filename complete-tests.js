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

runner.run().catch(console.error);