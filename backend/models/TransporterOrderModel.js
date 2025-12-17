import mongoose from "mongoose";

const transporterOrderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, required: true },
    orderDate: { type: Date, required: true },
    txHash: { type: String, required: true },
    hospitalName: { type: String, required: true },
    hospitalWallet: { type: String, required: true },
    equipmentId: { type: Number, required: true },
    equipmentName: { type: String, required: true },
    transporterName: { type: String, required: true },
    transporterWallet: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("TransporterOrder", transporterOrderSchema);
