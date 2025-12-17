import express from "express";
import { createOrder, getOrders, markShipped, markDelivered } from "../controllers/orderController.js";

const router = express.Router();

router.post("/orders", createOrder);
router.get("/orders", getOrders);

router.put("/ship/:id", markShipped);
router.put("/deliver/:id", markDelivered);

export default router;
