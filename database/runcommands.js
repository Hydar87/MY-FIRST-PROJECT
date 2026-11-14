const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function readAllUsers() {
  try {
    // Query to select all users (excluding the password hash for security)
    const query = `
      SELECT id, public_id, email, username, created_at, updated_at 
      FROM users;
    `;

    const result = await pool.query(query);

    console.log(`\n📋 Found ${result.rows.length} user(s) in the database:\n`);
    
    // Print each row neatly
    result.rows.forEach((user, index) => {
      console.log(`--- User #${index + 1} ---`);
      console.log(`  ID:         ${user.id}`);
      console.log(`  Public ID:  ${user.public_id}`);
      console.log(`  Username:   ${user.username}`);
      console.log(`  Email:      ${user.email}`);
      console.log(`  Created At: ${user.created_at}\n`);
    });

  } catch (err) {
    console.error('❌ Failed to read data:', err.message);
  } finally {
    await pool.end();
  }
}

readAllUsers();