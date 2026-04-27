const db = require('./src/config/db');

const makeAdmin = async () => {
  const emailToPromote = 'testuser@gmail.com'; // 👈 Replace with your email!

  try {
    console.log(`⏳ Promoting ${emailToPromote} to admin...`);
    
    const result = await db.query(
      "UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, email, role",
      [emailToPromote]
    );

    if (result.rows.length === 0) {
      console.log("❌ Error: No user found with that email.");
    } else {
      console.log("✅ Success! User is now an admin:");
      console.table(result.rows[0]);
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Database error:", err.message);
    process.exit(1);
  }
};

makeAdmin();