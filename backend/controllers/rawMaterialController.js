import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import RawMaterial from "../models/RawModel.js";
import Web3 from "web3";

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Contract ABI
const jsonPath = path.join(__dirname, "../build/contracts/MedicalSupplyChain.json");

let MedicalSupplyChainABI;
try {
  MedicalSupplyChainABI = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log("Contract ABI Loaded!");
} catch (err) {
  console.error("Error loading contract ABI:", err);
}

// Web3 setup
const web3 = new Web3("http://127.0.0.1:7545");

// Replace with your deployed contract address
const contractAddress = "0x137cef1f280aB24852027CF98349a98846BF8B8b";

// Contract instance
export const contract = new web3.eth.Contract(
  MedicalSupplyChainABI.abi,
  contractAddress
);

// ----------------------------------------------------------
//                     ADD RAW MATERIAL
// ----------------------------------------------------------
export const addRawMaterial = async (req, res) => {
  try {
    const { name, quantity, price, category, supplier } = req.body;
    const image = req.file ? req.file.filename : null;

    // Validations
    if (!name || !quantity || !price || !category || !supplier || !image) {
      return res.json({ success: false, message: "All fields including image are required" });
    }

    // Verify supplier on-chain
    const isSupplier = await contract.methods
      .suppliers(supplier.toLowerCase())
      .call();

    if (!isSupplier) {
      return res.json({
        success: false,
        message: "User is not registered as a supplier on the blockchain",
      });
    }

    // ------------------------------------------------------
    //   BLOCKCHAIN TRANSACTION (ALL 4 CONTRACT ARGUMENTS)
    // ------------------------------------------------------
    const txReceipt = await contract.methods
      .createRawMaterial(name, quantity, price, category)
      .send({ from: supplier, gas: 300000 });

    // Get latest on-chain ID
    const rawId = await contract.methods.rawMaterialCount().call();

    // ------------------------------------------------------
    //   SAVE IN MONGODB
    // ------------------------------------------------------
    const material = await RawMaterial.create({
      rawId,
      name,
      quantity,
      price,
      category,
      supplier,
      image,
      txHash: txReceipt.transactionHash,
    });

    res.json({
      success: true,
      message: "Raw material added successfully!",
      material,
    });

  } catch (err) {
    console.error("Add Raw Material Error:", err);
    res.json({ success: false, message: "Error adding raw material" });
  }
};


//  GET ALL RAW MATERIALS (FROM DB ONLY)

export const getAllRawMaterials = async (req, res) => {
  try {
    const materials = await RawMaterial.find({});
    res.json(materials);
  } catch (err) {
    console.error("Load Raw Material Error:", err);
    res.status(500).json({ message: "Error loading raw materials" });
  }
};

