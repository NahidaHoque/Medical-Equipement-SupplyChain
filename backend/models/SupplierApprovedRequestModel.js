import mongoose from "mongoose";

const supplierApprovedRequestSchema = new mongoose.Schema(
  {
    rawId: { type: Number, required: true },                // Blockchain raw material ID
    name: { type: String, required: true },                 // Raw material name
    quantity: { type: Number, required: true }, 
    usedQuantity: { type: Number, default: 0 },           // Quantity requested
    price: { type: Number, required: true },               // Price per unit
    totalPrice: { type: Number, required: true },          // Total price = price * quantity
    manufacturerAddress: { type: String, required: true }, // Manufacturer wallet address
    manufacturerName: { type: String, required: true },    // Manufacturer name
    supplierId: { type: String, required: true },          // Supplier wallet address
    supplierName: { type: String, required: true },        // Supplier name
    requestApproveId: { type: Number, required: true },    // Smart contract request ID
    status: { type: String, enum: ["approved", "cancelled"], required: true },
    image: { type: String },                                // Optional raw material image
    txHash: { type: String },                               // Smart contract transaction hash
  },
  { timestamps: true }
);

const SupplierApprovedRequest = mongoose.model(
  "SupplierApprovedRequest",
  supplierApprovedRequestSchema
);

export default SupplierApprovedRequest;
