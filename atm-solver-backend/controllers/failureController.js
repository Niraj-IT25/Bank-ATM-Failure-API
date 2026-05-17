// controllers/failureController.js
import Failure from "../models/Failure.js";

// CREATE - Report ATM Failure
export const createFailure = async (req, res) => {
  try {
    const { atmId, customerName, customerPhone, issueType } = req.body;

    // Validate required fields
    if (!atmId || !customerName || !customerPhone || !issueType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if a failure with the same atmId already exists
    const failureExist = await Failure.findOne({ atmId });
    if (failureExist && failureExist.status !== "Resolved") {
      return res.status(400).json({ 
        message: "Active failure for this ATM already exists. Please resolve the existing one first." 
      });
    }

    // Create new failure record
    const failure = new Failure({
      atmId,
      customerName,
      customerPhone,
      issueType,
      timestamp: new Date(),
      status: "Pending",
      reportedBy: req.admin?.id || "anonymous", // Track who reported if logged in
    });

    const savedFailure = await failure.save();
    
    res.status(201).json({
      message: "Failure reported successfully",
      failure: savedFailure
    });

  } catch (error) {
    console.error("Error creating failure:", error);
    res.status(500).json({ error: "Internal Server Error. Failed to report failure." });
  }
};

// READ - Get All Failures
export const getFailures = async (req, res) => {
  try {
    const failures = await Failure.find().sort({ timestamp: -1 });
    
    if (failures.length === 0) {
      return res.status(200).json({
        message: "No failures found",
        failures: []
      });
    }
    
    res.status(200).json({
      total: failures.length,
      failures: failures
    });
  } catch (error) {
    console.error("Error fetching failures:", error);
    res.status(500).json({ error: "Internal Server Error. Failed to fetch failures." });
  }
};

// UPDATE - Mark Failure as Resolved or Edit
export const updateFailure = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid failure ID format" });
    }

    // Check if failure exists
    const failureExist = await Failure.findById(id);
    if (!failureExist) {
      return res.status(404).json({ message: "Failure not found." });
    }

    // Update the failure
    const updateData = {
      status: status || "Resolved",
      resolutionNotes: resolutionNotes || "Fixed by technician",
      resolvedBy: req.admin?.id || "system", // Track who resolved it
      resolvedAt: new Date(),
    };

    const updatedFailure = await Failure.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      message: "Failure updated successfully",
      failure: updatedFailure
    });
  } catch (error) {
    console.error("Error updating failure:", error);
    res.status(500).json({ error: "Internal Server Error. Failed to update failure." });
  }
};

// DELETE - Remove Failure Record (Only Super Admin & Admin with permission)
export const deleteFailure = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid failure ID format" });
    }

    // Check if failure exists
    const failureExist = await Failure.findById(id);
    if (!failureExist) {
      return res.status(404).json({ message: "Failure not found." });
    }

    // Log deletion
    console.log(`[DELETION] User: ${req.admin?.username} | Failure ID: ${id} | Timestamp: ${new Date()}`);

    // Delete the failure
    await Failure.findByIdAndDelete(id);

    res.status(200).json({ 
      message: "Failure deleted successfully",
      deletedId: id,
      deletedBy: req.admin?.username || "system"
    });
  } catch (error) {
    console.error("Error deleting failure:", error);
    res.status(500).json({ error: "Internal Server Error. Failed to delete failure." });
  }
};

// GET - Failure Statistics (For reports/analytics)
export const getFailureStats = async (req, res) => {
  try {
    const totalFailures = await Failure.countDocuments();
    const pendingFailures = await Failure.countDocuments({ status: "Pending" });
    const resolvedFailures = await Failure.countDocuments({ status: "Resolved" });
    const inProgressFailures = await Failure.countDocuments({ status: "In Progress" });

    // Get failures by type
    const failuresByType = await Failure.aggregate([
      { $group: { _id: "$issueType", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      stats: {
        total: totalFailures,
        pending: pendingFailures,
        inProgress: inProgressFailures,
        resolved: resolvedFailures,
        byType: failuresByType,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal Server Error. Failed to fetch statistics." });
  }
};

// EXPORT - Get Failures as CSV (For admin/super_admin)
export const exportFailures = async (req, res) => {
  try {
    const failures = await Failure.find().sort({ timestamp: -1 });

    if (failures.length === 0) {
      return res.status(404).json({ message: "No failures to export" });
    }

    // Convert to CSV format
    let csv = "ATM ID,Customer Name,Phone,Issue Type,Status,Reported Date,Resolved Date,Notes\n";
    
    failures.forEach((failure) => {
      csv += `"${failure.atmId}","${failure.customerName}","${failure.customerPhone}","${failure.issueType}","${failure.status}","${failure.timestamp}","${failure.resolvedAt || 'N/A'}","${failure.resolutionNotes || ''}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=failures.csv");
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting failures:", error);
    res.status(500).json({ error: "Internal Server Error. Failed to export failures." });
  }
};
