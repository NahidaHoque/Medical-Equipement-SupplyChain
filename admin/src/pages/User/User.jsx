import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Web3 from "web3";
import "./User.css";

// Import ABI JSON
import MedicalSupplyChainJSON from "../../contracts/MedicalSupplyChain.json";

const contractAbi = MedicalSupplyChainJSON.abi;
const contractAddress = "0x137cef1f280aB24852027CF98349a98846BF8B8b";

const UserList = ({ url }) => {
  const [users, setUsers] = useState([]);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    walletAddress: "",
    contact: "",
    userAddress: "",
    role: "",
  });

  const [editData, setEditData] = useState({
    name: "",
    role: "",
    contact: "",
    userAddress: "",
    walletAddress: "",
  });

  // ---------------- Connect MetaMask ----------------
  const connectMetaMask = async () => {
    if (!window.ethereum) return toast.error("MetaMask not detected!");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      toast.success(`Connected account: ${accounts[0]}`);

      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(contractAbi, contractAddress);
      setContract(contractInstance);
    } catch (err) {
      console.error(err);
      toast.error("User denied MetaMask connection");
    }
  };

  // ---------------- Listen for account changes ----------------
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) setAccount(accounts[0]);
        else setAccount(null);
      });
    }
  }, []);

  // ---------------- Fetch all users ----------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${url}/api/user/user`);
        if (response.data.success) setUsers(response.data.data);
        else toast.error("Error fetching users");
      } catch (err) {
        console.error(err);
        toast.error("Network error");
      }
    };
    fetchUsers();
  }, [url]);

  // ---------------- Add New User ----------------
  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.walletAddress || !newUser.contact || !newUser.userAddress || !newUser.role) {
      return toast.error("All fields are required!");
    }
    try {
      const response = await axios.post(`${url}/api/user/add`, { ...newUser, password: "null1234" });
      if (response.data.success) {
        toast.success("User added!");
        setUsers([...users, response.data.user]);
        setShowAddForm(false);
        setNewUser({ name: "", email: "", walletAddress: "", contact: "", userAddress: "", role: "" });
      } else toast.error("Failed to add user");
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  // ---------------- Start editing ----------------
  const startEdit = (user) => {
    setEditingUser(user);
    setEditData({
      name: user.name,
      role: user.role || "",
      contact: user.contact || "",
      userAddress: user.userAddress || "",
      walletAddress: user.walletAddress || "",
    });
  };

  // ---------------- Update User ----------------
  const updateUser = async () => {
    if (!editingUser) return toast.error("No user selected!");
    if (!editData.name || !editData.role || !editData.contact || !editData.userAddress || !editData.walletAddress) {
      return toast.error("All fields are required!");
    }

    try {
      // Update MongoDB
      const response = await axios.post(`${url}/api/user/edit`, { id: editingUser._id, ...editData });
      if (!response.data.success) return toast.error("Failed to update user!");

      setUsers(users.map((u) => (u._id === editingUser._id ? { ...u, ...editData } : u)));
      toast.success("User updated in database!");

      // On-chain registration
      if (
        ["supplier", "manufacturer", "hospital", "transporter", "stakeholder"].includes(editData.role) &&
        editData.walletAddress
      ) {
        if (!account) return toast.error("MetaMask account not connected!");
        if (!contract) return toast.error("Contract not initialized!");

        const superAdmin = await contract.methods.superAdmin().call();

        if (account.toLowerCase() !== superAdmin.toLowerCase())
          return toast.error("Only superAdmin can register users on-chain!");

        try {
          if (editData.role === "supplier") {
            await contract.methods
              .registerSupplier(
                editData.walletAddress,
                editData.name,
                editData.contact,
                editingUser.email,
                editData.userAddress
              )
              .send({ from: account });
            toast.success("Supplier registered on-chain!");
          }

          if (editData.role === "manufacturer") {
            await contract.methods
              .registerManufacturer(
                editData.walletAddress,
                editData.name,
                editData.contact,
                editingUser.email,
                editData.userAddress
              )
              .send({ from: account });
            toast.success("Manufacturer registered on-chain!");
          }

          if (editData.role === "hospital") {
            await contract.methods
              .registerHospital(
                editData.walletAddress,
                editData.name,
                editData.contact,
                editingUser.email,
                editData.userAddress
              )
              .send({ from: account });
            toast.success("Hospital registered on-chain!");
          }

          if (editData.role === "transporter") {
            await contract.methods
              .registerTransporter(
                editData.walletAddress,
                editData.name,
                editData.contact,
                editingUser.email,
                editData.userAddress
              )
              .send({ from: account });
            toast.success("Transporter registered on-chain!");
          }

          if (editData.role === "stakeholder") {
            await contract.methods
              .registerStakeholder(
                editData.walletAddress,
                editData.name,
                editData.contact,
                editingUser.email,
                editData.userAddress
              )
              .send({ from: account });
            toast.success("Stakeholder registered on-chain!");
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to register on-chain!");
        }
      }

      setEditingUser(null);
    } catch (err) {
      console.error(err);
      toast.error("Error updating user!");
    }
  };

  // ---------------- Delete user ----------------
  const removeUser = async (userId) => {
    try {
      const response = await axios.post(`${url}/api/user/remove`, { id: userId });
      if (response.data.success) {
        toast.success("User deleted successfully!");
        setUsers(users.filter((u) => u._id !== userId));
      } else toast.error("Failed to delete user");
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  return (
    <div className="list add flex-col">
      <p>All Users</p>

      {!account && <button className="connect-btn" onClick={connectMetaMask}>Connect MetaMask</button>}

      <div className="user-table">
        <div className="user-table-format title">
          <b>Name</b>
          <b>Email</b>
          <b>Wallet</b>
          <b>Contact</b>
          <b>Address</b>
          <b>Remove</b>
          <b>Edit</b>
        </div>

        {users.map((user) => (
          <div key={user._id} className="user-table-format">
            <p>{user.name}</p>
            <p>{user.email}</p>
            <p>{user.walletAddress || "Wallet not set"}</p>
            <p>{user.contact}</p>
            <p>{user.userAddress}</p>
            <p className="cursor delete" onClick={() => removeUser(user._id)}>X</p>
            <p className="cursor edit" onClick={() => startEdit(user)}>Edit</p>
          </div>
        ))}
      </div>

      {/* ---------- Add User Form ---------- */}
      {showAddForm && (
        <div className="edit-form">
          <h3>Add New User</h3>

          <label>Name</label>
          <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />

          <label>Email</label>
          <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />

          <label>Wallet Address</label>
          <input type="text" value={newUser.walletAddress} onChange={(e) => setNewUser({ ...newUser, walletAddress: e.target.value })} />

          <label>Contact</label>
          <input type="text" value={newUser.contact} onChange={(e) => setNewUser({ ...newUser, contact: e.target.value })} />

          <label>Physical Address</label>
          <input type="text" value={newUser.userAddress} onChange={(e) => setNewUser({ ...newUser, userAddress: e.target.value })} />

          <label>Role</label>
          <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
            <option value="">Select role</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="supplier">Supplier</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="hospital">Hospital</option>
            <option value="transporter">Transporter</option>
            <option value="stakeholder">Stakeholder</option>
          </select>

          <div className="actions">
            <button className="update-btn" onClick={addUser}>Add User</button>
            <button className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ---------- Edit User Form ---------- */}
      {editingUser && (
        <div className="edit-form">
          <h3>Edit User</h3>

          <label>User ID</label>
          <input type="text" value={editingUser._id} readOnly />

          <label>Email</label>
          <input type="text" value={editingUser.email} readOnly />

          <label>Wallet Address</label>
          <input type="text" value={editingUser.walletAddress} readOnly />

          <label>Name</label>
          <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />

          <label>Contact</label>
          <input type="text" value={editData.contact} onChange={(e) => setEditData({ ...editData, contact: e.target.value })} />

          <label>Physical Address</label>
          <input type="text" value={editData.userAddress} onChange={(e) => setEditData({ ...editData, userAddress: e.target.value })} />

          <label>Role</label>
          <select value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })}>
            <option value="">Select role</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="supplier">Supplier</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="hospital">Hospital</option>
            <option value="transporter">Transporter</option>
            <option value="stakeholder">Stakeholder</option>
          </select>

          <div className="actions">
            <button className="update-btn" onClick={updateUser}>Update</button>
            <button className="cancel-btn" onClick={() => setEditingUser(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ---------- Show Add Button ---------- */}
      {!showAddForm && !editingUser && (
        <button className="add-btn" onClick={() => setShowAddForm(true)}>Add New User</button>
      )}
    </div>
  );
};

export default UserList;
