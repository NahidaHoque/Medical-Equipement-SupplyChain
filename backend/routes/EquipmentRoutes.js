import express from "express";
import {
  createEquipment,
  getVerifiedEquipment,
  verifyEquipment,
  getAllEquipment,
  getEquipmentNames 
} from "../controllers/EquipmentController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/create", upload.single("image"), createEquipment);

// GET all equipment
router.get("/", getAllEquipment);  // <--- ADD THIS

router.get("/verified", getVerifiedEquipment);

// Toggle verification
router.put("/verify/:id", verifyEquipment);

router.get("/names", getEquipmentNames);

export default router;
