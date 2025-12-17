import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String, required: true },              // <-- added
  userAddress: { type: String, required: true },          // <-- physical address
  walletAddress: { type: String, required: true, unique: true }, // <-- metamask wallet
  password: { type: String, required: true },
  role: { type: String, default: "user" }                // optional, assigned by superadmin
});

export default mongoose.model("User", userSchema);
