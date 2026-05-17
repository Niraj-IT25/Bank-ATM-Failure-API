// server.js
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import failureRoute from "./routes/failureRoutes.js";
import adminAuthRoute from "./routes/adminAuthRoutes.js";

const app = express();

// Load environment variables
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===== ROUTES =====

// 1. ADMIN AUTHENTICATION ROUTES (No token required)
// POST /admin/auth/register - Create new admin
// POST /admin/auth/login - Login admin
// GET /admin/auth/profile - Get profile (requires token)
// POST /admin/auth/logout - Logout
app.use("/admin/auth", adminAuthRoute);

// 2. FAILURE ROUTES (Handled by failureRoutes.js)
// Already includes middleware checks inside
app.use("/", failureRoute);

// Default Route
app.get("/", (req, res) => {
  res.send("✓ Bank Management System API Running...");
});

// Health Check Route
app.get("/health", (req, res) => {
  res.json({ message: "✓ API is healthy", status: "connected" });
});

// Start Server
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/bankSystem";

mongoose
  .connect(MONGO_URL, {
  })
  .then(() => {
    console.log("\n✓ Database connected successfully.");
    console.log(`✓ Server is running : ${MONGO_URL}`);

    app.listen(PORT, () => {
      console.log(`✓ Server is running on port: ${PORT}`);
      console.log(`✓ API Base URL: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("✗ Database connection error:", error.message);
    process.exit(1);
  });