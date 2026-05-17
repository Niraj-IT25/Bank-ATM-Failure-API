// routes/adminAuthRoutes.js
import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  logoutAdmin,
  getAllAdmins,
  deleteAdmin,
} from "../controllers/adminAuthController.js";
import { verifyToken, isSuperAdmin } from "../middleware/authMiddleware.js";

const route = express.Router();

// Public routes
route.post("/register", registerAdmin);    // Register new admin
route.post("/login", loginAdmin);          // Login admin

// Protected routes (require JWT token)
route.get("/profile", verifyToken, getAdminProfile);     // Get admin profile
route.post("/logout", verifyToken, logoutAdmin);         // Logout

// Super admin only routes
route.get("/all-admins", verifyToken, isSuperAdmin, getAllAdmins);     // Get all admins
route.delete("/:id", verifyToken, isSuperAdmin, deleteAdmin);          // Delete admin

export default route;