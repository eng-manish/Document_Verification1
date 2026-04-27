const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const documentRoutes = require('./routes/document');
const app = express();
const blockchainRoutes = require('./routes/blockchain');
const digilockerRoutes = require('./routes/digilocker');
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',           // Allows local development
    'https://your-app-name.vercel.app' // REPLACE this with your actual Vercel URL after deployment
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  credentials: true
}));
app.use(express.json());
app.use('/api/documents', documentRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
// Test Routes
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/digilocker', digilockerRoutes);
app.get('/test', (req, res) => {
  res.status(200).json({ message: "Server is running! 🚀" });
});
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: "You accessed a protected route!", user: req.user });
});
app.use('/api/admin', adminRoutes);
// DB Connection Test Route
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.status(200).json({ 
      status: "DB Connected", 
      time: result.rows[0].now 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server live on http://localhost:${PORT}`);
});