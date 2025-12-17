import express from "express";
import {
  createTransporterOrder,
  getTransporterOrders,
} from "../controllers/TransporterOrderController.js";

const router = express.Router();

// Create a new transporter order
router.post("/create", createTransporterOrder);

// Get all transporter orders
router.get("/", getTransporterOrders);

export default router;
