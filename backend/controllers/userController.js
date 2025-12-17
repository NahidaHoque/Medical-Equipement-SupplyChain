import path from "path";
import fs from "fs";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import Web3 from "web3";

// -----------------------------------------------------
// CORRECT ABI PATH (Important!)
// -----------------------------------------------------
const __dirname = path.resolve(); 
const abiPath = path.join(__dirname, "build/contracts/MedicalSupplyChain.json");

let MedicalSupplyChainABI;
try {
  MedicalSupplyChainABI = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
  console.log("ABI Loaded Successfully");
} catch (err) {
  console.error("Error loading ABI:", err);
}

// -----------------------------------------------------
// Web3 Setup
// -----------------------------------------------------
const web3 = new Web3("http://127.0.0.1:7545");

// Your contract address (put your deployed one)
const contractAddress = "0x137cef1f280aB24852027CF98349a98846BF8B8b";

// Create contract instance ONCE
const contract = new web3.eth.Contract(MedicalSupplyChainABI.abi, contractAddress);

// -------------------- JWT Token --------------------
const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// -------------------- Blockchain Registration --------------------
const registerOnChain = async (walletAddress, role, userInfo) => {
  try {
    const superAdmin = (await web3.eth.getAccounts())[0];

    switch (role) {
      case "supplier":
        await contract.methods
          .registerSupplier(walletAddress, userInfo.name, userInfo.contact, userInfo.email, userInfo.userAddress)
          .send({ from: superAdmin, gas: 300000 });
        break;

      case "manufacturer":
        await contract.methods
          .registerManufacturer(walletAddress, userInfo.name, userInfo.contact, userInfo.email, userInfo.userAddress)
          .send({ from: superAdmin, gas: 300000 });
        break;

      case "hospital":
        await contract.methods
          .registerHospital(walletAddress, userInfo.name, userInfo.contact, userInfo.email, userInfo.userAddress)
          .send({ from: superAdmin, gas: 300000 });
        break;

      case "transporter":
        await contract.methods
          .registerTransporter(walletAddress, userInfo.name, userInfo.contact, userInfo.email, userInfo.userAddress)
          .send({ from: superAdmin, gas: 300000 });
        break;

      case "stakeholder":
        await contract.methods
          .registerStakeholder(walletAddress, userInfo.name, userInfo.contact, userInfo.email, userInfo.userAddress)
          .send({ from: superAdmin, gas: 300000 });
        break;
    }
  } catch (err) {
    console.log("Blockchain registration error:", err);
    throw err;
  }
};

// -------------------- Register User --------------------
export const registerUser = async (req, res) => {
  const { name, email, password, walletAddress, contact, userAddress } = req.body;

  try {
    if (!name || !email || !password || !walletAddress || !contact || !userAddress)
      return res.json({ success: false, message: "All fields are required" });

    if (!validator.isEmail(email))
      return res.json({ success: false, message: "Invalid email" });

    if (password.length < 8)
      return res.json({ success: false, message: "Weak password" });

    if (await userModel.findOne({ email }))
      return res.json({ success: false, message: "Email already exists" });

    if (await userModel.findOne({ walletAddress }))
      return res.json({ success: false, message: "Wallet already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      contact,
      userAddress,
      walletAddress,
      role: "user"
    });

    // OPTIONAL: Register on blockchain if needed
    // await registerOnChain(walletAddress, "user", { name, contact, email, userAddress });

    user.password = undefined;

    const token = createToken(user._id);

    return res.json({ success: true, message: "User registered", token, user });

  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: "Server error" });
  }
};


// -------------------- Login User --------------------
export const loginUser = async (req, res) => {
  const { email, password, walletAddress } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!walletAddress || user.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.json({ success: false, message: "Wallet address mismatch" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, message: "Wrong password" });
    }

    // 🔐 SET SESSION (NEW)
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress
    };

    user.password = undefined;

    const token = createToken(user._id); // keep JWT if already used

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user
    });

  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: "Server error" });
  }
};


// -------------------- Get All Users --------------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({});
    const safeUsers = users.map(u => ({ ...u._doc, password: undefined }));
    res.json({ success: true, data: safeUsers });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Server error" });
  }
};

// -------------------- Remove User --------------------
export const removeUser = async (req, res) => {
  const { id } = req.body;
  try {
    await userModel.findByIdAndDelete(id);
    return res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: "Server error" });
  }
};

// -------------------- Add User (Admin) --------------------
export const addUser = async (req, res) => {
  try {
    const { name, email, password, walletAddress, contact, userAddress, role } = req.body;
    if (!name || !email || !password || !walletAddress || !contact || !userAddress)
      return res.json({ success: false, message: "All fields required" });

    if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
    if (await userModel.findOne({ email })) return res.json({ success: false, message: "Email already exists" });
    if (await userModel.findOne({ walletAddress })) return res.json({ success: false, message: "Wallet already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      contact,
      userAddress,
      walletAddress,
      role: role || "user",
    });

    // Register on-chain if role is relevant
    await registerOnChain(user.walletAddress, user.role, { name, contact, email, userAddress });

    const safeUser = { ...user._doc, password: undefined };
    return res.json({ success: true, message: "User added", user: safeUser });

  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: "Server error" });
  }
};

// -------------------- Edit User (Admin) --------------------
export const editUser = async (req, res) => {
  const { id, name, email, walletAddress, contact, userAddress, role } = req.body;
  try {
    const user = await userModel.findById(id);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (await userModel.findOne({ email, _id: { $ne: id } })) 
      return res.json({ success: false, message: "Email already in use" });

    const oldRole = user.role;
    user.name = name || user.name;
    user.email = email || user.email;
    user.walletAddress = walletAddress || user.walletAddress;
    user.contact = contact || user.contact;
    user.userAddress = userAddress || user.userAddress;
    user.role = role || user.role;

    await user.save();

    // If role changed and needs on-chain registration
    if (role && ["supplier","manufacturer","hospital","transporter","stakeholder"].includes(role) && oldRole !== role) {
      await registerOnChain(user.walletAddress, role, { name: user.name, contact: user.contact, email: user.email, userAddress: user.userAddress });
    }

    user.password = undefined;
    return res.json({ success: true, message: "User updated successfully", user });

  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: "Server error" });
  }
};

export const getUserByWallet = async (req, res) => {
  try {
    const wallet = req.params.walletAddress.toLowerCase();
    const user = await userModel.findOne({ walletAddress: wallet });
    if (!user) return res.status(404).json({ username: "Unknown" });

    res.json({ username: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ username: "Unknown" });
  }
};

// controllers/userController.js

export const getUserEmailByWallet = async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress;

    if (!walletAddress) {
      return res.status(400).json({ success: false, email: "" });
    }

    const user = await userModel.findOne({
      walletAddress: { $regex: new RegExp(`^${walletAddress}$`, "i") }
    });

    if (!user) {
      return res.json({ success: false, email: "" });
    }

    return res.json({
      success: true,
      email: user.email
    });
  } catch (error) {
    console.error("getUserEmailByWallet error:", error);
    return res.status(500).json({ success: false, email: "" });
  }
};

// -------------------- Get Current Session User --------------------
export const getCurrentUser = async (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ success: true, user: req.session.user });
  }
  return res.status(401).json({ success: false });
};

export const logoutUser = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false });
    }

    res.clearCookie("connect.sid"); // session cookie
    return res.json({ success: true });
  });
};
