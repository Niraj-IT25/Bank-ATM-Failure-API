// models/Admin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    
    // ============ ROLE-BASED ACCESS CONTROL ============
    role: {
      type: String,
      enum: {
        values: ["super_admin", "admin", "technician", "viewer"],
        message: "Role must be: super_admin, admin, technician, or viewer",
      },
      default: "viewer",
    },

    // ============ PERMISSIONS ============
    permissions: {
      // Failure Management
      canViewFailures: { type: Boolean, default: true },
      canCreateFailures: { type: Boolean, default: true },
      canEditFailures: { type: Boolean, default: false },
      canResolveFailures: { type: Boolean, default: false },
      canDeleteFailures: { type: Boolean, default: false },

      // User Management
      canViewUsers: { type: Boolean, default: false },
      canCreateUsers: { type: Boolean, default: false },
      canEditUsers: { type: Boolean, default: false },
      canDeleteUsers: { type: Boolean, default: false },

      // Reports & Analytics
      canViewReports: { type: Boolean, default: false },
      canGenerateReports: { type: Boolean, default: false },

      // System Settings
      canAccessSettings: { type: Boolean, default: false },
      canModifySettings: { type: Boolean, default: false },
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Track account creation
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    // Department/Location
    department: {
      type: String,
      default: "General",
    },

    // Phone for notifications
    phone: {
      type: String,
      match: [/^\d{10}$/, "Phone must be 10 digits"],
      default: null,
    },

    // Last login tracking
    lastLogin: {
      type: Date,
      default: null,
    },

    // Account lock after failed attempts
    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    // Activity log
    activityLog: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        details: String,
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if account is locked
AdminSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Method to increment login attempts
AdminSchema.methods.incLoginAttempts = async function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Otherwise we're incrementing
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 30; // 30 minutes

  // Lock account if we've reached max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + lockTime * 60 * 1000) };
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
AdminSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Method to set last login
AdminSchema.methods.setLastLogin = async function () {
  this.lastLogin = Date.now();
  await this.save();
};

// Method to check permission
AdminSchema.methods.hasPermission = function (permission) {
  return this.permissions[permission] === true;
};

// Method to set role-based permissions automatically
AdminSchema.methods.setRolePermissions = function () {
  const permissionsByRole = {
    super_admin: {
      canViewFailures: true,
      canCreateFailures: true,
      canEditFailures: true,
      canResolveFailures: true,
      canDeleteFailures: true,
      canViewUsers: true,
      canCreateUsers: true,
      canEditUsers: true,
      canDeleteUsers: true,
      canViewReports: true,
      canGenerateReports: true,
      canAccessSettings: true,
      canModifySettings: true,
    },
    admin: {
      canViewFailures: true,
      canCreateFailures: true,
      canEditFailures: true,
      canResolveFailures: true,
      canDeleteFailures: true,
      canViewUsers: true,
      canCreateUsers: true,
      canEditUsers: true,
      canDeleteUsers: false,
      canViewReports: true,
      canGenerateReports: true,
      canAccessSettings: true,
      canModifySettings: false,
    },
    technician: {
      canViewFailures: true,
      canCreateFailures: true,
      canEditFailures: true,
      canResolveFailures: true,
      canDeleteFailures: false,
      canViewUsers: false,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canViewReports: true,
      canGenerateReports: false,
      canAccessSettings: false,
      canModifySettings: false,
    },
    viewer: {
      canViewFailures: true,
      canCreateFailures: false,
      canEditFailures: false,
      canResolveFailures: false,
      canDeleteFailures: false,
      canViewUsers: false,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canViewReports: false,
      canGenerateReports: false,
      canAccessSettings: false,
      canModifySettings: false,
    },
  };

  this.permissions = permissionsByRole[this.role] || permissionsByRole.viewer;
};

// Set permissions before saving if role changed
AdminSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    this.setRolePermissions();
  }
  next();
});

export default mongoose.model("Admin", AdminSchema);
