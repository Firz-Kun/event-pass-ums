// scripts/init-database.js
// This script creates the initial admin user with a properly hashed password

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function initDatabase() {
  console.log('🔧 Initializing database...');
  
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ums_event_pass'
    });

    console.log('✅ Connected to database');

    // Hash the admin password
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Check if admin already exists
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@ums.edu.my']
    );

    if (existing.length > 0) {
      console.log('⚠️  Admin user already exists, updating password...');
      await connection.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [adminPassword, 'admin@ums.edu.my']
      );
    } else {
      console.log('➕ Creating admin user...');
      await connection.query(
        `INSERT INTO users (id, email, password, name, role, status, email_verified, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        ['admin-1', 'admin@ums.edu.my', adminPassword, 'System Administrator', 'admin', 'active', true]
      );
    }

    console.log('✅ Admin user ready!');
    console.log('');
    console.log('📝 Login credentials:');
    console.log('   Email: admin@ums.edu.my');
    console.log('   Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the admin password after first login!');

    await connection.end();
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

initDatabase();
