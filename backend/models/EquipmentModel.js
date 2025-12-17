import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  equipmentId: { type: Number, required: true, unique: true },        // match smart contract
  rawMaterialRequestId: { type: Number, required: true },             // requestApproveId
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },                        // raw units used per equipment
  totalPrice: { type: Number, required: true },
  category: { type: String, required: true },
  manufacturerName: { type: String, required: true },
  supplierName: { type: String, required: true },
  //supplierWallet: { type: String, required: true },
  manufacturerWallet: { type: String, required: true },
  txHash: { type: String },
  image: { type: String },
  registered: { type: Boolean, default: true },
  verified: { type: Boolean, default: false },
  available: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Equipment", equipmentSchema);
