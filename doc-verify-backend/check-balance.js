const { ethers } = require('ethers');
require('dotenv').config();

async function check() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const balance = await provider.getBalance(wallet.address);
    console.log("-----------------------------------------");
    console.log("Checking Server Wallet...");
    console.log(`Address: ${wallet.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    console.log("-----------------------------------------");
}

check();