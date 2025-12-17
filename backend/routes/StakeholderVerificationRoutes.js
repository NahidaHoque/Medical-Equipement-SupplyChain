import express from "express";
import { createStakeholderVerification, verifyStakeholder } from "../controllers/StakeholderVerificationController.js";

const router = express.Router();

router.post("/create", createStakeholderVerification);
router.put("/verify/:id", verifyStakeholder);

export default router;
