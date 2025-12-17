import SupplierApprovedRequest from "../models/SupplierApprovedRequestModel.js";
import RawMaterial from "../models/RawModel.js";
import AvailableRawMaterial from "../models/AvailableRawMaterialsModel.js";

// Handle approve/cancel action by supplier
// Handle approve/cancel action by supplier
export const handleSupplierAction = async (req, res) => {
  //console.log("Request body received:", req.body);

  try {
    const { requestId, status, requestApproveId, manufacturerName, supplierName, txHash, quantity: requestedQuantity } = req.body;

    if (!requestId || !["approved", "cancelled"].includes(status) || !requestApproveId) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    // Find the requested raw material in AvailableRawMaterial (for request details)
    const request = await AvailableRawMaterial.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Find the actual raw material in RawMaterial collection
    const rawMaterial = await RawMaterial.findOne({ rawId: request.rawId });
    if (!rawMaterial) {
      return res.status(404).json({ success: false, message: "Raw material not found" });
    }

    // Reduce quantity in RawMaterial if approved
    if (status === "approved") {
      if (rawMaterial.quantity < request.quantity) {
        return res.status(400).json({ success: false, message: "Insufficient quantity available" });
      }
      rawMaterial.quantity -= request.quantity;
      await rawMaterial.save();
    }

    // Save supplier approved request
    const approvedRequest = new SupplierApprovedRequest({
      rawId: request.rawId,
      name: request.name,
      quantity: request.quantity, // requested quantity
      usedQuantity: 0,
      price: request.price,
      totalPrice: request.price * request.quantity,
      manufacturerAddress: request.manufacturerAddress,
      manufacturerName: manufacturerName || request.manufacturerAddress,
      supplierId: request.supplierId,
      supplierName: supplierName || request.supplierId,
      requestApproveId, // smart contract ID
      status,
      image: request.image,
      txHash,
    });

    await approvedRequest.save();

    // Update status in AvailableRawMaterial
    request.status = status;
    await request.save();

    res.status(200).json({ success: true, data: approvedRequest });
  } catch (err) {
    console.error("Supplier action error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// Get all approved/cancelled requests for a supplier
export const getSupplierApprovedRequests = async (req, res) => {
  try {
    const supplierWallet = req.params.supplierId.toLowerCase();
    const requests = await SupplierApprovedRequest.find({ supplierId: supplierWallet });
    res.status(200).json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get approved requests for a manufacturer
export const getApprovedRequestsByManufacturer = async (req, res) => {
  try {
    const manufacturerWallet = req.params.manufacturerAddress.toLowerCase();
    const requests = await SupplierApprovedRequest.find({ manufacturerAddress: manufacturerWallet });
    res.status(200).json({ success: true, requests });
  } catch (err) {
    console.error("Manufacturer fetch error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateUsedQuantity = async (req, res) => {
  try {
    const { requestId, usedQuantity } = req.body;

    // Find by numeric field requestApproveId, NOT _id
    const request = await SupplierApprovedRequest.findOne({ requestApproveId: requestId });

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    request.usedQuantity = (request.usedQuantity || 0) + Number(usedQuantity);
    await request.save();

    return res.status(200).json({ success: true, data: request });
  } catch (err) {
    console.error("Update used quantity failed:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
