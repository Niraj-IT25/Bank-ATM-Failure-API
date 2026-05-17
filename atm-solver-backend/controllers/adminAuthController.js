// controllers/adminAuthController.js
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRE = "7d";

// Generate JWT Token WITH PERMISSIONS
const generateToken = (admin) => {
  return jwt.sign(
    { 
      id: admin._id,
      role: admin.role,
      permissions: admin.permissions  // ✅ INCLUDE PERMISSIONS!
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRE }
  );
};

// REGISTER - Create new admin account with role
export const registerAdmin = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, role } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }],
    });

    if (existingAdmin) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    // Validate role
    const validRoles = ["super_admin", "admin", "technician", "viewer"];
    const userRole = role && validRoles.includes(role) ? role : "viewer";

    const admin = new Admin({
      username,
      email,
      password,
      role: userRole,
    });

    // Set permissions based on role
    admin.setRolePermissions();

    await admin.save();

    // Generate token WITH permissions
    const token = generateToken(admin);

    console.log(`✓ New user: ${username} role: ${userRole}`);

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Error registering admin" });
  }
};

// LOGIN - Admin login with email and password
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: "Admin account is inactive" });
    }

    const isPasswordCorrect = await admin.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token WITH permissions
    const token = generateToken(admin);

    console.log(`✓ Login: ${email} role: ${admin.role}`);

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error during login" });
  }
};

// GET PROFILE
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        permissions: admin.permissions,  // ✅ INCLUDE PERMISSIONS
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Error fetching profile" });
  }
};

// LOGOUT
export const logoutAdmin = async (req, res) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error during logout" });
  }
};

// GET ALL ADMINS - WITH PERMISSION CHECK
export const getAllAdmins = async (req, res) => {
  try {
    console.log(`\n[REQUEST] getAllAdmins`);
    console.log(`  Admin ID: ${req.admin.id}`);
    console.log(`  Admin Role: ${req.admin.role}`);
    console.log(`  Permissions: ${JSON.stringify(req.admin.permissions)}`);

    const currentAdmin = await Admin.findById(req.admin.id);

    if (!currentAdmin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Only admin and super_admin can view users
    if (!["admin", "super_admin"].includes(currentAdmin.role)) {
      console.log(`  ❌ DENIED: User role ${currentAdmin.role} not allowed`);
      return res.status(403).json({ message: "You do not have permission to view users" });
    }

    const admins = await Admin.find({}, "-password");

    console.log(`  ✓ SUCCESS: Returning ${admins.length} users\n`);

    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ error: "Error fetching admins" });
  }
};

// DELETE ADMIN - WITH PERMISSION CHECK
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`\n[REQUEST] deleteAdmin`);
    console.log(`  Admin ID: ${req.admin.id}`);
    console.log(`  Admin Role: ${req.admin.role}`);
    console.log(`  Target ID: ${id}`);

    const currentAdmin = await Admin.findById(req.admin.id);

    if (!currentAdmin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Only admin and super_admin can delete
    if (!["admin", "super_admin"].includes(currentAdmin.role)) {
      console.log(`  ❌ DENIED: User role ${currentAdmin.role} not allowed`);
      return res.status(403).json({ message: "You do not have permission to delete users" });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin._id.toString() === currentAdmin._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    await Admin.findByIdAndDelete(id);

    console.log(`  ✓ SUCCESS: User ${admin.username} deleted\n`);

    res.status(200).json({
      message: "Admin deleted successfully",
      deletedUser: admin.username
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ error: "Error deleting admin" });
  }
};
