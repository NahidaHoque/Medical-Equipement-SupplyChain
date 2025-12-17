// AvailableRawMaterialsController.js
import AvailableRawMaterial from "../models/AvailableRawMaterialsModel.js";
import { contract } from "../contract.js";

// ---------------- Add Available Raw Material ----------------
export const addAvailableRawMaterial = async (req, res) => {
  try {
    const {
      rawId,
      contractRequestId,
      name,
      quantity,
      price,
      category,
      supplierId,
      supplierName,
      status,
      txHash,
      manufacturerAddress,
    } = req.body;

    const image = req.file ? req.file.filename : req.body.image || null;

    const newMaterial = new AvailableRawMaterial({
      rawId: Number(rawId),                 
      contractRequestId: contractRequestId || null,  
      name,
      quantity,
      price,
      category,
      supplierId: supplierId.toLowerCase(), 
      supplierName,
      manufacturerAddress: manufacturerAddress?.toLowerCase(), 
      status: status || "pending",
      txHash,
      image,
    });

    await newMaterial.save();
    res.status(201).json({ success: true, data: newMaterial });
  } catch (error) {
    console.error("Error adding raw material:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Get Material by ID ----------------
export const getAvailableRawMaterialById = async (req, res) => {
  try {
    const material = await AvailableRawMaterial.findById(req.params.id);
    if (!material)
      return res.status(404).json({ success: false, message: "Material not found" });

    const totalPrice = material.price * (req.query.requestQty ? Number(req.query.requestQty) : 1);

    res.json({ ...material.toObject(), totalPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Get All Materials ----------------
export const getAllAvailableRawMaterials = async (req, res) => {
  try {
    const materials = await AvailableRawMaterial.find();

    const materialsWithTotalPrice = materials.map((m) => ({
      ...m.toObject(),
      totalPrice: m.price * 1, // default request quantity = 1
    }));

    res.json(materialsWithTotalPrice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Cancel Request ----------------
export const cancelRequest = async (req, res) => {
  try {
    const { requestId, manufacturerAddress } = req.body;

    if (!requestId || !manufacturerAddress) {
      return res.status(400).json({
        success: false,
        message: "Missing parameters",
      });
    }

    // Cancel on Smart Contract
    await contract.methods
      .cancelRawMaterialRequest(requestId)
      .send({ from: manufacturerAddress.toLowerCase(), gas: 300000 });

    // ✔ FIX: cancel matching contractRequestId
    const material = await AvailableRawMaterial.findOne({
      contractRequestId: requestId,
    });

    if (material) {
      material.status = "cancelled";
      await material.save();
    }

    res.json({ success: true, message: "Request cancelled successfully" });
  } catch (err) {
    console.error("Cancel request error:", err);
    res.status(500).json({ success: false, message: "Failed to cancel request" });
  }
};


// Get all requests for a supplier
export const getRequestsForSupplier = async (req, res) => {
  try {
    const supplierWallet = req.params.supplierId.toLowerCase();

    // fetch all requests made by manufacturers for this supplier's raw materials
    const requests = await AvailableRawMaterial.find({ supplierId: supplierWallet });

    res.status(200).json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
