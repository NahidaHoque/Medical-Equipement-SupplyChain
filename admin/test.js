import Web3 from "web3";

// -------------------- CONFIG --------------------
const provider = "http://127.0.0.1:7545"; // Ganache
const web3 = new Web3(provider);

// Contract address (deployed)
const contractAddress = "0x137cef1f280aB24852027CF98349a98846BF8B8b";

// Contract ABI (only including rawMaterials & rawMaterialRequests)
const contractAbi = [
  {
    inputs: [],
    name: "rawMaterialCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "rawMaterials",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "quantity", type: "uint256" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "string", name: "category", type: "string" },
      { internalType: "address", name: "supplier", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "requestCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "rawMaterialRequests",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "uint256", name: "rawMaterialId", type: "uint256" },
      { internalType: "uint256", name: "quantity", type: "uint256" },
      { internalType: "address", name: "manufacturer", type: "address" },
      { internalType: "bool", name: "approved", type: "bool" },
      { internalType: "bool", name: "cancelledBySupplier", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// -------------------- MAIN --------------------
const main = async () => {
  const contract = new web3.eth.Contract(contractAbi, contractAddress);

  try {
    const requestCount = await contract.methods.requestCount().call();
    console.log(`📌 Total raw material requests: ${requestCount}\n`);

    if (requestCount == 0) {
      console.log("❌ No requests found.");
      return;
    }

    for (let i = 1; i <= requestCount; i++) {
      const r = await contract.methods.rawMaterialRequests(i).call();
      console.log(`🧩 Request #${i}`);
      console.log(`Request ID: ${r.id}`);
      console.log(`Raw Material ID: ${r.rawMaterialId}`);
      console.log(`Quantity: ${r.quantity}`);
      console.log(`Manufacturer: ${r.manufacturer}`);
      console.log(`Approved: ${r.approved}`);
      console.log(`Cancelled by Supplier: ${r.cancelledBySupplier}`);
      console.log("-------------------------");
    }
  } catch (err) {
    console.error("❌ Error reading raw material requests:", err);
  }
};

main();
