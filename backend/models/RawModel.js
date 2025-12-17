import mongoose from "mongoose";

const RawSchema = new mongoose.Schema({
  rawId: { type: Number, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  supplier: { type: String, required: true },
  image: { type: String },
  txHash: { type: String }
}, { timestamps: true });

export default mongoose.model("Raw", RawSchema);
