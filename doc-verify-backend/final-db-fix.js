const db = require('./src/config/db');

const fix = async () => {
  try {
    console.log("⏳ Fixing database columns and promoting user...");
    
    // 1. Ensures the 'role' column exists in your Render DB
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
    `);
    
    // 2. Promotes your specific email to 'admin'
    // 💡 REPLACE 'testuser@gmail.com' with your actual login email!
    await db.query(`
      UPDATE users 
      SET role = 'admin' 
      WHERE email = 'testuser@gmail.com'
    `);
    
    console.log("✅ Database updated! You are now an Admin.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Fix failed:", err.message);
    process.exit(1);
  }
};

fix();