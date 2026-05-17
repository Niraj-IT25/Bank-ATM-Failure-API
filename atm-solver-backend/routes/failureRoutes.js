// routes/failureRoutes.js
import express from "express";
import {
  createFailure,
  getFailures,
  updateFailure,
  deleteFailure,
} from "../controllers/failureController.js";
import {
  verifyToken,
  checkPermission,
} from "../middleware/authMiddleware.js";

const route = express.Router();

// ============ PUBLIC ROUTES (No authentication required) ============

// Report a new failure (Public - anyone can report)
route.post("/failures", createFailure);

// Get all failures (Public - anyone can view)
route.get("/failures", getFailures);

// ============ PROTECTED ROUTES (Requires login + permission) ============

// Update failure status (requires canResolveFailures permission)
// Technician, Admin, Super Admin can resolve
route.put("/failures/:id", verifyToken, checkPermission("canResolveFailures"), updateFailure);

// DELETE failure (requires canDeleteFailures permission)
// Only Admin and Super Admin can delete
// Technician and Viewer CANNOT delete - will get 403 Forbidden
route.delete("/failures/:id", verifyToken, checkPermission("canDeleteFailures"), deleteFailure);

export default route;
