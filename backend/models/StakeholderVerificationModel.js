import mongoose from "mongoose";

const stakeholderVerificationSchema = new mongoose.Schema({
  equipmentId: { type: Number, required: true },
  name: { type: String, required: true },
  rawMaterialRequestId: { type: Number, required: true },
  manufacturerName: { type: String, required: true },
  category: { type: String, required: true },
  manufacturerWallet: { type: String, required: true },
  stakeholderName: { type: String, required: true },
  stakeholderWallet: { type: String, required: true },
  txHash: { type: String },
  verified: { type: Boolean, default: false },
  available: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("StakeholderVerification", stakeholderVerificationSchema);
