import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import { Routes, Route, Navigate } from 'react-router-dom';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import UserList from './pages/User/User'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Web3 from 'web3';

// Minimal ABI to read superAdmin
const contractAbi = [
  {
    inputs: [],
    name: "superAdmin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

const contractAddress = "0x137cef1f280aB24852027CF98349a98846BF8B8b";

const App = () => {
  const url = "http://localhost:4000";
  const [account, setAccount] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const connectMetaMask = async () => {
      if (!window.ethereum) {
        toast.error("MetaMask not detected!");
        return;
      }

      try {
        // Request accounts
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const currentAccount = accounts[0];
        setAccount(currentAccount);

        // Check if account is superAdmin
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(contractAbi, contractAddress);
        const superAdmin = await contract.methods.superAdmin().call();

        if (superAdmin && currentAccount.toLowerCase() === superAdmin.toLowerCase()) {
          setIsSuperAdmin(true);
          toast.success("Connected as SuperAdmin");
        } else {
          setIsSuperAdmin(false);
          toast.info("Connected account is not SuperAdmin");
        }

        // Update if user switches accounts
        window.ethereum.on("accountsChanged", async (accounts) => {
          const newAccount = accounts[0];
          setAccount(newAccount);
          const superAdmin = await contract.methods.superAdmin().call();
          setIsSuperAdmin(newAccount.toLowerCase() === superAdmin.toLowerCase());
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to connect MetaMask");
      }
    };

    connectMetaMask();
  }, []);

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <ToastContainer />
        <h2>🚫 Access Denied</h2>
        <p>This dashboard is only accessible by the SuperAdmin wallet.</p>
      </div>
    );
  }


  return (
    <div>
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/users" replace />} />

            <Route path="/add" element={<Add url={url} />} />
            <Route path="/list" element={<List url={url} />} />
            <Route path="/orders" element={<Orders url={url} />} />
            <Route
              path="/users"
              element={<UserList url={url} account={account} isSuperAdmin={isSuperAdmin} />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
