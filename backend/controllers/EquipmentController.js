import Equipment from "../models/EquipmentModel.js";
import SupplierApprovedRequest from "../models/SupplierApprovedRequestModel.js"; // for updating usedQuantity
import path from "path";
import fs from "fs";

// Create Equipment
// Create Equipment
export const createEquipment = async (req, res) => {
  try {
    const {
      rawMaterialRequestId,
      name,
      price,
      quantity,
      totalPrice,
      category,
      manufacturerName,
      //manufacturerWallet,
      supplierName,
      //supplierWallet,
      txHash,
      registered,
      verified,
      available,
    } = req.body;

    const image = req.file ? req.file.filename : null;

    // Generate equipmentId (auto increment, based on DB count)
    const lastEquipment = await Equipment.findOne().sort({ equipmentId: -1 });
    const equipmentId = lastEquipment ? lastEquipment.equipmentId + 1 : 1;

    // Make sure manufacturerWallet and supplierWallet are set
    const manufacturerWallet = req.body.manufacturerWallet; // or req.body.manufacturerWallet
    // if (!supplierWallet) {
    //   return res.status(400).json({ success: false, message: "supplierWallet is required" });
    // }
    const equipmentCount = await Equipment.countDocuments();
    const equipment = new Equipment({
      //equipmentId,
      equipmentId :equipmentCount + 1,
      rawMaterialRequestId,
      name,
      price,
      quantity,
      totalPrice: price * quantity,
      category,
      manufacturerName,
      manufacturerWallet,
      supplierName,
      //supplierWallet,
      txHash,
      image,
      registered: registered === "true",
      verified: verified === "true",
      available: available === "true",
    });

    await equipment.save();

    // Update usedQuantity in SupplierApprovedRequest
    const request = await SupplierApprovedRequest.findOne({ requestApproveId: rawMaterialRequestId });

    if (request) {
      request.usedQuantity = (request.usedQuantity || 0) + Number(quantity);
      await request.save();
    }

    return res.status(201).json({ success: true, data: equipment });
  } catch (err) {
    console.error("Create equipment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all equipment
export const getAllEquipment = async (req, res) => {
  try {
    const equipments = await Equipment.find();
    return res.status(200).json({ success: true, data: equipments });
  } catch (err) {
    console.error("Get all equipment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all verified equipment
export const getVerifiedEquipment = async (req, res) => {
  try {
    const verifiedItems = await Equipment.find({ verified: true });
    return res.status(200).json({ success: true, data: verifiedItems });
  } catch (err) {
    console.error("Get verified equipment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Toggle verification status
export const verifyEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const updated = await Equipment.findByIdAndUpdate(
      id,
      { verified, available: verified === true },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Verify equipment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get unique equipment names (for prediction)
export const getEquipmentNames = async (req, res) => {
  try {
    const equipments = await Equipment.find({}, { name: 1, _id: 0 });
    const uniqueNames = [...new Set(equipments.map(e => e.name))];

    res.status(200).json({
      success: true,
      data: uniqueNames,
    });
  } catch (err) {
    console.error("Get equipment names error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
