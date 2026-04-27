const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');
const { anchorToBlockchain } = require('../utils/blockchain');

/**
 * @route   GET /api/admin/documents
 * @desc    Get all documents in the system for administrative review
 * @access  Private (Admin only)
 */
router.get('/documents', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT documents.*, users.email 
       FROM documents 
       JOIN users ON documents.user_id = users.id
       ORDER BY documents.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PATCH /api/admin/documents/:id
 * @desc    Approve or Reject a document. Approving triggers blockchain anchoring.
 * @access  Private (Admin only)
 */
router.patch('/documents/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  // Validation
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: "Invalid status. Use 'APPROVED' or 'REJECTED'." });
  }

  try {
    // 1. Verify document existence and current state
    const docResult = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: "Document not found." });
    }

    const doc = docResult.rows[0];
    let txHash = doc.tx_hash;

    // 2. BLOCKCHAIN ANCHORING
    // If status is 'APPROVED' and it hasn't been anchored yet, send hash to Sepolia
    if (status === 'APPROVED' && !doc.tx_hash) {
      try {
        // Calls the utility function to interact with the Smart Contract
        txHash = await anchorToBlockchain(doc.hash);
      } catch (blockchainErr) {
        console.error("Blockchain anchoring error:", blockchainErr);
        return res.status(500).json({ 
          error: "Failed to anchor document to blockchain. Ensure wallet has sufficient ETH.",
          details: blockchainErr.message 
        });
      }
    }

    // 3. DATABASE UPDATE
    // Persist the new status and the blockchain transaction ID (if any)
    const finalResult = await db.query(
      'UPDATE documents SET status = $1, tx_hash = $2 WHERE id = $3 RETURNING *',
      [status, txHash, id]
    );

    res.json({ 
      message: status === 'APPROVED' ? "Document approved and anchored to Sepolia!" : "Document rejected.", 
      blockchain_proof: txHash,
      document: finalResult.rows[0] 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;