import express from "express";
import {
  handleSupplierAction,
  getSupplierApprovedRequests,
  getApprovedRequestsByManufacturer,
  updateUsedQuantity
} from "../controllers/SupplierApprovedRequestController.js";

const router = express.Router();

// Supplier action: approve or cancel
router.post("/action", handleSupplierAction);

// Get all approved/cancelled requests for supplier
router.get("/supplier/:supplierId", getSupplierApprovedRequests);
router.get("/manufacturer/:manufacturerAddress", getApprovedRequestsByManufacturer);
router.post("/update-used", updateUsedQuantity);



export default router;
