import express from "express";
import multer from "multer";
import {
  addAvailableRawMaterial,
  getAvailableRawMaterialById,
  getAllAvailableRawMaterials,
  cancelRequest,
  getRequestsForSupplier
} from "../controllers/AvailableRawMaterialsController.js";

const router = express.Router();

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/raw_images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ---------------- Routes ----------------

// Add new raw material
router.post("/add", upload.single("image"), addAvailableRawMaterial);

// Get a single raw material by ID
router.get("/:id", getAvailableRawMaterialById);

// Get all raw materials
router.get("/", getAllAvailableRawMaterials);

// Cancel a request
router.post("/cancel", cancelRequest);

// Get all requests for a supplier
router.get("/supplier/:supplierId/requests", getRequestsForSupplier);


export default router;
