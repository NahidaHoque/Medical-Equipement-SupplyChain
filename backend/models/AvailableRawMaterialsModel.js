import mongoose from "mongoose";

const availableRawMaterialSchema = new mongoose.Schema(
  {
    rawId: { type: Number, required: true },
    contractRequestId: { type: String },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    totalPrice: { type: Number },
    category: { type: String },
    supplierId: { type: String, required: true },
    supplierName: { type: String },
    manufacturerAddress: { type: String },
    status: { type: String, default: "pending" },
    image: { type: String },
    txHash: { type: String },
  },
  { timestamps: true }
);

const AvailableRawMaterial = mongoose.model(
  "AvailableRawMaterial",
  availableRawMaterialSchema
);

export default AvailableRawMaterial;
