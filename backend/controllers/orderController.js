import orderModel from "../models/orderModel.js";

// Create new order
export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    const order = await orderModel.create(orderData);
    res.json({ success: true, message: "Order saved", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save order" });
  }
};

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// Mark order as shipped
export const markShipped = async (req, res) => {
  const { role } = req.body;

  if (role !== "transporter") {
    return res.status(403).json({ success: false, message: "Only transporter can mark shipped" });
  }

  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.shipped) return res.status(400).json({ success: false, message: "Order already shipped" });

    order.shipped = true;
    await order.save();

    res.json({ success: true, message: "Order marked as shipped", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark order as delivered
export const markDelivered = async (req, res) => {
  const { role } = req.body;

  if (role !== "hospital") {
    return res.status(403).json({ success: false, message: "Only hospital can mark delivered" });
  }

  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!order.shipped) return res.status(400).json({ success: false, message: "Order must be shipped first" });
    if (order.delivered) return res.status(400).json({ success: false, message: "Order already delivered" });

    order.delivered = true;
    await order.save();

    res.json({ success: true, message: "Order marked as delivered", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};