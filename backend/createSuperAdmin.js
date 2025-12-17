// createSuperAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";
import userModel from "./models/userModel.js";
import Web3 from "web3";
import fs from "fs";

// --------------------
// Config
// --------------------
const MONGO_URI = process.env.MONGO_URI;
const GANACHE_RPC = "http://127.0.0.1:7545";
const DEPLOYER_ADDRESS = "0xC301B297FE273E18Ee52697C5CE3EF3DD0f89a94"; // your deployer/metamask/ganache account
const CONTRACT_ADDRESS = "0x137cef1f280aB24852027CF98349a98846BF8B8b"; // deployed MedicalSupplyChain address

// --------------------
// Connect to MongoDB
// --------------------
try {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");
} catch (err) {
  console.error("MongoDB connection error:", err);
  process.exit(1);
}

// --------------------
// Load contract ABI (no import error now)
// --------------------
let MedicalSupplyChain;
try {
  const jsonData = fs.readFileSync(
    "./build/contracts/MedicalSupplyChain.json",
    "utf-8"
  );
  MedicalSupplyChain = JSON.parse(jsonData);
  console.log("Contract ABI loaded");
} catch (err) {
  console.error("Error loading contract JSON:", err);
  process.exit(1);
}

// --------------------
// Setup Web3 & Contract
// --------------------
const web3 = new Web3(GANACHE_RPC);

const contract = new web3.eth.Contract(
  MedicalSupplyChain.abi,
  CONTRACT_ADDRESS
);

// --------------------
// Create Super Admin
// --------------------
try {
  const hashedPassword = await bcrypt.hash("1234567899", 10);

  const exists = await userModel.findOne({ role: "superadmin" });

  if (!exists) {
    await userModel.create({
      name: "nadia",
      email: "nadia@gmail.com",
      password: hashedPassword,
      address: DEPLOYER_ADDRESS,
      role: "superadmin",
    });

    console.log("Super Admin created!");
  } else {
    console.log("Super Admin already exists");
  }
} catch (err) {
  console.error("Error creating SuperAdmin:", err);
}

// --------------------
// Exit script
// --------------------
process.exit();
