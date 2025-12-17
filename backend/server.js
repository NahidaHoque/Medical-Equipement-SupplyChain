import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";

import userRouter from "./routes/userRoute.js";
import rawRouter from "./routes/rawRoute.js";
import rawMaterialRequestRoutes from "./routes/AvailableRawMaterialsRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import supplierApprovedRequestRoutes from "./routes/SupplierApprovedRequestRoutes.js";
import EquipmentRoutes from "./routes/EquipmentRoutes.js";
import stakeholderVerificationRoutes from "./routes/StakeholderVerificationRoutes.js";
import transporterOrdersRoutes from "./routes/TransporterOrderRoute.js";

// App config
const app = express();
const port = process.env.PORT || 4000;

// 🔹 Middleware
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173", // frontend
  "http://localhost:5174"  // admin panel
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


app.use(cookieParser());

// 🔐 SESSION (GLOBAL – applies to ALL routes)
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "my_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,     // true in production (HTTPS)
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

// DB connection
connectDB();

// API endpoints
app.use("/api/user", userRouter);
app.use("/api/raw", rawRouter);
app.use("/api/raw-material-requests", rawMaterialRequestRoutes);

app.use("/raw_uploads", express.static("raw_uploads"));
app.use("/uploads/equipment", express.static("uploads/equipment"));

app.use("/api/supplier-approved-requests", supplierApprovedRequestRoutes);
app.use("/api/equipment", EquipmentRoutes);
app.use("/api/stakeholder-verification", stakeholderVerificationRoutes);

app.use("/api", orderRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/transporter-orders", transporterOrdersRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API working");
});

app.get("/debug", (req, res) => {
  res.json({
    session: req.session,
    cookie: req.headers.cookie
  });
});


// Start server
app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);
