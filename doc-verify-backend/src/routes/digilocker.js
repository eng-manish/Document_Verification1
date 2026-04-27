const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// 1. GET DigiLocker Status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT digilocker_connected FROM users WHERE id = $1', [req.user.id]);
    res.json({ connected: result.rows[0].digilocker_connected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. CONNECT (Mock Logic)
router.post('/connect', authMiddleware, async (req, res) => {
  try {
    await db.query('UPDATE users SET digilocker_connected = TRUE WHERE id = $1', [req.user.id]);
    res.json({ 
      success: true, 
      message: "UI-only connection established. (Mock Integration)" 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DISCONNECT
router.post('/disconnect', authMiddleware, async (req, res) => {
  try {
    await db.query('UPDATE users SET digilocker_connected = FALSE WHERE id = $1', [req.user.id]);
    res.json({ success: true, message: "DigiLocker disconnected." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;