import express from "express";
import {
  loginUser,
  registerUser,
  getAllUsers,
  removeUser,
  addUser,
  editUser,
  getUserByWallet,
  getUserEmailByWallet,
  getCurrentUser,
  logoutUser
} from "../controllers/userController.js";

import User from "../models/userModel.js";

const userRouter = express.Router();

/* =========================
   🔐 AUTH MIDDLEWARE
========================= */
const isAuth = (req, res, next) => {
  if (req.session && req.session.user) next();
  else res.status(401).json({ success: false, message: "Unauthorized" });
};

/* =========================
   AUTH ROUTES
========================= */

// Register
userRouter.post("/register", registerUser);

// ✅ Login (DO NOT WRAP)
userRouter.post("/login", loginUser);

// ✅ Logout (DESTROY SESSION)
userRouter.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false });
    }

    res.clearCookie("connect.sid"); // 🔥 CORRECT COOKIE NAME
    res.json({ success: true, message: "Logged out" });
  });
});

// ✅ Get logged-in user (USED ON REFRESH)
userRouter.get("/me", isAuth, (req, res) => {
  res.json({ success: true, user: req.session.user });
});

/* =========================
   USER MANAGEMENT
========================= */

userRouter.get("/user", getAllUsers);
userRouter.get("/all", getAllUsers);

userRouter.post("/remove", removeUser);
userRouter.post("/add", addUser);
userRouter.post("/edit", editUser);

userRouter.get("/email/byWallet/:walletAddress", getUserEmailByWallet);
userRouter.get("/byWallet/:walletAddress", getUserByWallet);

/* =========================
   SUPERADMIN
========================= */

userRouter.get("/superadmin", async (req, res) => {
  try {
    const superAdmin = await User.findOne({ role: "superadmin" });
    if (!superAdmin) {
      return res.json({ success: false, message: "No superadmin found" });
    }

    res.json({ success: true, user: superAdmin });
  } catch (err) {
    console.error("Failed to fetch superadmin:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default userRouter;
