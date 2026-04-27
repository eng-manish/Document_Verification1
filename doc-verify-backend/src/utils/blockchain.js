const { ethers } = require('ethers');
require('dotenv').config();

// 1. The Smart Contract ABI (Application Binary Interface)
// This tells ethers how to talk to your specific contract functions
const contractABI = [
    "function addDocument(string memory _docHash) public",
    "function verifyDocument(string memory _docHash) public view returns (bool, address, uint256)"
];

// 2. Setup Provider, Wallet, and Contract instance
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

/**
 * Anchors a document's SHA-256 hash to the Ethereum Sepolia Testnet.
 * @param {string} fileHash - The hex string of the document hash.
 * @returns {string} The transaction hash as proof of anchoring.
 */
const anchorToBlockchain = async (fileHash) => {
    try {
        console.log(`🔗 Initiating blockchain anchor for hash: ${fileHash.substring(0, 10)}...`);

        // Call the smart contract function
        const tx = await contract.addDocument(fileHash);

        console.log("⏳ Transaction sent. Waiting for block confirmation...");
        
        // Wait for 1 block confirmation (standard for testnets)
        const receipt = await tx.wait();

        console.log(`✅ Anchored! Transaction Hash: ${receipt.hash}`);
        return receipt.hash;
    } catch (err) {
        console.error("Blockchain Utility Error:", err.message);
        throw new Error("Blockchain transaction failed. Ensure your wallet has Sepolia ETH and RPC is valid.");
    }
};

module.exports = { anchorToBlockchain };