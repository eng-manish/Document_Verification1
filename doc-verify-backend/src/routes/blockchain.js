const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// 1. RECORD TRANSACTION HASH
// The frontend calls this after MetaMask succeeds
router.post('/anchor', authMiddleware, async (req, res) => {
  const { documentId, txHash } = req.body;

  if (!documentId || !txHash) {
    return res.status(400).json({ error: "Missing documentId or txHash" });
  }

  try {
    const result = await db.query(
      'UPDATE documents SET tx_hash = $1, status = $2 WHERE id = $3 RETURNING *',
      [txHash, 'VERIFIED', documentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({ 
      message: "Blockchain proof recorded successfully!", 
      document: result.rows[0] 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. VERIFY ANCHOR (Optional)
// Check if a document is officially on the ledger
router.get('/verify-anchor/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, hash, tx_hash, status FROM documents WHERE id = $1', 
      [req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });

    const doc = result.rows[0];
    if (doc.tx_hash) {
      res.json({ 
        isAnchored: true, 
        explorerUrl: `https://sepolia.etherscan.io/tx/${doc.tx_hash}`,
        document: doc 
      });
    } else {
      res.json({ isAnchored: false, message: "Document has not been anchored to blockchain yet." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;