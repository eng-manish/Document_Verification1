const db = require('./src/config/db');

const initDatabase = async () => {
  try {
    console.log("⏳ Connecting to Render and syncing schema...");
    
    // 1. Create Users Table (Includes DigiLocker status)
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        digilocker_connected BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Create Documents Table (Includes Hash and Blockchain Tx Hash)
    const createDocsTable = `
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'PENDING',
        file_path TEXT NOT NULL,
        hash TEXT,
        tx_hash TEXT, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Migration Queries (To add columns if tables already exist)
    const migrations = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS digilocker_connected BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE documents ADD COLUMN IF NOT EXISTS hash TEXT;",
      "ALTER TABLE documents ADD COLUMN IF NOT EXISTS tx_hash TEXT;"
    ];

    // Execute Table Creation
    await db.query(createUsersTable);
    await db.query(createDocsTable);

    // Execute Migrations
    console.log("🛠️ Running schema migrations...");
    for (let query of migrations) {
      await db.query(query);
    }
    
    console.log("✅ Success! Database schema is fully synced for Phase 6.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error initializing database:", err.message);
    process.exit(1);
  }
};

initDatabase();