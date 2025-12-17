import Web3 from "web3";
import fs from "fs";
import path from "path";

// ------------------ WEB3 SETUP ------------------
const web3 = new Web3("http://127.0.0.1:7545"); // Ganache / Hardhat

// 🔴 Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x137cef1f280aB24852027CF98349a98846BF8B8b";

// ------------------ LOAD ABI ------------------
const __dirname = path.resolve();
const abiPath = path.join(
  __dirname,
  "build/contracts/MedicalSupplyChain.json"
);

const contractJson = JSON.parse(fs.readFileSync(abiPath, "utf8"));

const contract = new web3.eth.Contract(
  contractJson.abi,
  CONTRACT_ADDRESS
);

// ------------------ READ SUPERADMIN DETAILS ------------------
const viewSuperAdminDetails = async () => {
  // 1️⃣ Get superAdmin address
  const superAdminAddress = await contract.methods.superAdmin().call();

  console.log("🔐 SuperAdmin Address:");
  console.log(superAdminAddress);

  // 2️⃣ Get user details of superAdmin
  const details = await contract.methods
    .userDetails(superAdminAddress)
    .call();

  console.log("\n📄 SuperAdmin Details (On-chain):");
  console.log("Name       :", details.name);
  console.log("Contact    :", details.contact);
  console.log("Email      :", details.emailId);
  console.log("User Addr  :", details.userAddress);
};

// ------------------ RUN ------------------
viewSuperAdminDetails()
  .then(() => {
    console.log("\n✅ SuperAdmin details fetched successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
