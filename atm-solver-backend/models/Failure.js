// models/Failure.js
import mongoose from "mongoose";

const FailureSchema = new mongoose.Schema(
  {
    atmId: {
      type: String,
      required: [true, "ATM ID is required"],
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
      match: [/^\d{10}$/, "Please provide a valid 10-digit phone number"],
    },
    issueType: {
      type: String,
      required: [true, "Issue type is required"],
      trim: true,
      enum: [
        "Cash not dispensed",
        "Card stuck",
        "Screen not working",
        "Keypad not responding",
        "Network issue",
        "Other",
      ],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "In Progress", "Resolved"],
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

export default mongoose.model("Failure", FailureSchema);
