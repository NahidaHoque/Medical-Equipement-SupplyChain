import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Web3 from "web3";

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to contract JSON
const jsonPath = path.join(__dirname, "./build/contracts/MedicalSupplyChain.json");

// Read and parse contract ABI
let MedicalSupplyChainABI;
try {
  const data = fs.readFileSync(jsonPath, "utf-8");
  MedicalSupplyChainABI = JSON.parse(data);
  console.log("Contract JSON loaded!");
} catch (err) {
  console.error("Error loading contract JSON:", err);
}

// Web3 setup
const web3 = new Web3("http://127.0.0.1:7545"); // Ganache RPC
const contractAddress = "0x137cef1f280aB24852027CF98349a98846BF8B8b"; // New contract address
export const contract = new web3.eth.Contract(MedicalSupplyChainABI.abi, contractAddress);
