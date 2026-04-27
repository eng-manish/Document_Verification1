const { Pool } = require('pg');
require('dotenv').config();

// Initialize the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // This SSL block is CRITICAL for cloud deployment (Render, Supabase, etc.)
  ssl: {
    rejectUnauthorized: false, // Allows connection to the cloud DB even without a local cert
  },
});

// Log successful connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected successfully to the cloud');
});

// Log errors
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  /**
   * Helper function to execute queries
   * @param {string} text - The SQL query
   * @param {params} params - The values for the query placeholders
   */
  query: (text, params) => pool.query(text, params),
};