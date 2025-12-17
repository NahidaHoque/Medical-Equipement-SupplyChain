import express from "express";
import Raw from "../models/RawModel.js";
import { rawUpload } from "../middleware/rawUpload.js";
import { getAllRawMaterials } from "../controllers/rawMaterialController.js";

const router = express.Router();


// GET ALL RAW MATERIALS

router.get("/", getAllRawMaterials);
router.get("/all", getAllRawMaterials);


// CREATE RAW MATERIAL

router.post("/", rawUpload.single("image"), async (req, res) => {
  const lastRaw = await Raw.findOne().sort({ rawId: -1 });
  const newRawId = lastRaw ? lastRaw.rawId + 1 : 1;

  try {
    const raw = new Raw({
      rawId: newRawId,
      name: req.body.name,
      quantity: req.body.quantity,
      price: req.body.price,
      category: req.body.category,
      supplier: req.body.supplier,
      txHash: req.body.txHash,
      image: req.file ? req.file.filename : null,
    });

    await raw.save();
    res.json({ message: "Raw material saved to MongoDB!", rawId: newRawId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET RAW MATERIAL BY ID

router.get("/:id", async (req, res) => {
  try {
    const raw = await Raw.findOne({ rawId: req.params.id });
    res.json(raw || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
