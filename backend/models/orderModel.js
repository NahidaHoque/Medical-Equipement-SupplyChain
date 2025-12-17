import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: { type: Number, required: true, unique: true },
  user: {
    name: String,
    email: String,
    contact: String,
    userAddress: String,
    walletAddress: String
  },
  items: [
    {
      equipmentId: String,
      name: String,
      quantity: Number,
      price: Number,
      image: String
    }
  ],
  totalPrice: Number,
  shipped: { type: Boolean, default: false },
  delivered: { type: Boolean, default: false },
  orderDate: { type: Date, default: Date.now }
});

const orderModel = mongoose.model("Order", orderSchema);
export default orderModel;
