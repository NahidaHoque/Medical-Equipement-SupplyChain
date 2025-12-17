import StakeholderVerification from "../models/StakeholderVerificationModel.js";

// Save verification request after stakeholder checks
export const createStakeholderVerification = async (req, res) => {
  try {
    const {
      equipmentId,
      name,
      rawMaterialRequestId,
      manufacturerName,
      category,
      manufacturerWallet,
      stakeholderName,
      stakeholderWallet,
    } = req.body;

    const verification = new StakeholderVerification({
      equipmentId,
      name,
      rawMaterialRequestId,
      manufacturerName,
      category,
      manufacturerWallet,
      stakeholderName,
      stakeholderWallet,
    });

    await verification.save();

    return res.status(201).json({ success: true, data: verification });
  } catch (err) {
    console.error("Create stakeholder verification error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update after stakeholder verifies on smart contract
export const verifyStakeholder = async (req, res) => {
  try {
    const { id } = req.params; // MongoDB _id of stakeholder verification
    const { txHash } = req.body;

    const updated = await StakeholderVerification.findByIdAndUpdate(
      id,
      { verified: true, available: true, txHash },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Verify stakeholder error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
