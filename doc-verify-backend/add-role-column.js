const db = require('./src/config/db');

const addColumn = async () => {
  try {
    console.log("⏳ Attempting to add 'role' column to users table...");
    
    // This command safely adds the column if it's missing
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
    `);

    console.log("✅ Success! The 'role' column is now in the database.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error adding column:", err.message);
    process.exit(1);
  }
};

addColumn();