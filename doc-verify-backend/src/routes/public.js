const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @route   GET /api/public/verify/:hash
 * @desc    Publicly verify a document using its SHA-256 hash
 * @access  Public
 */
router.get('/verify/:hash', async (req, res) => {
  const { hash } = req.params;

  try {
    // 1. Search for the document by its unique file hash
    const query = `
      SELECT documents.name, documents.status, documents.tx_hash, documents.created_at, users.email 
      FROM documents 
      JOIN users ON documents.user_id = users.id 
      WHERE documents.hash = $1
    `;
    const result = await db.query(query, [hash]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        verified: false, 
        message: "No record found for this document hash. It may be forged or not yet registered." 
      });
    }

    const doc = result.rows[0];

    // 2. Privacy: Mask the owner's email (e.g., ma****h@gmail.com)
    const [name, domain] = doc.email.split('@');
    const maskedEmail = `${name[0]}${name[1]}****${name[name.length - 1]}@${domain}`;

    // 3. Return the public verification data
    res.json({
      verified: true,
      document_name: doc.name,
      status: doc.status,
      issued_to: maskedEmail,
      timestamp: doc.created_at,
      blockchain_proof: doc.tx_hash ? `https://sepolia.etherscan.io/tx/${doc.tx_hash}` : "Not yet anchored",
      integrity_hash: hash
    });

  } catch (err) {
    res.status(500).json({ error: "Server error during verification." });
  }
});

module.exports = router;