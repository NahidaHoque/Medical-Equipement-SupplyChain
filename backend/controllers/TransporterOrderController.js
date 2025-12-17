import TransporterOrder from "../models/TransporterOrderModel.js";

// Create transporter order
export const createTransporterOrder = async (req, res) => {
  try {
    const orderData = req.body;

    const newOrder = await TransporterOrder.create(orderData);

    return res.status(201).json({
      success: true,
      message: "Transporter order saved successfully",
      data: newOrder,
    });
  } catch (err) {
    console.error("Error creating transporter order:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create transporter order",
      error: err.message,
    });
  }
};

// Get all transporter orders
export const getTransporterOrders = async (req, res) => {
  try {
    const orders = await TransporterOrder.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.error("Error fetching transporter orders:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transporter orders",
      error: err.message,
    });
  }
};
