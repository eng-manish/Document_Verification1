const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// 1. Configure Local Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath); 
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// 2. UPLOAD API (With Hashing)
router.post('/upload', authMiddleware, upload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const { originalname, mimetype, path: filePath } = req.file;
  const userId = req.user.id;

  try {
    // Generate SHA-256 Hash
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Save to DB
    const result = await db.query(
      'INSERT INTO documents (user_id, name, type, file_path, hash) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, originalname, mimetype, filePath, hashSum]
    );

    res.status(201).json({ 
      message: "Document uploaded and hashed!", 
      document: result.rows[0] 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET USER DOCUMENTS
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM documents WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. VERIFY INTEGRITY (The Phase 5 Deliverable)
router.get('/verify/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Document not found" });

    const doc = result.rows[0];
    
    // Re-hash the file currently on disk
    const fileBuffer = fs.readFileSync(doc.file_path);
    const currentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    if (currentHash === doc.hash) {
      res.json({ status: "AUTHENTIC", message: "Integrity verified. File is unchanged." });
    } else {
      res.status(401).json({ status: "TAMPERED", message: "Warning: File content has been modified!" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE DOCUMENT
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const doc = await db.query('SELECT * FROM documents WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (doc.rows.length === 0) return res.status(404).json({ error: "Document not found" });

    if (fs.existsSync(doc.rows[0].file_path)) fs.unlinkSync(doc.rows[0].file_path);

    await db.query('DELETE FROM documents WHERE id = $1', [req.params.id]);
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;