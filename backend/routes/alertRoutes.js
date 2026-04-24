const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");
const Staff = require("../models/Staff");

// CREATE ALERT with auto-assignment
router.post("/alert", async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();

    // --- AUTO-ASSIGN STAFF ---
    const systemId = req.body.systemId || "default";
    const emergencyType = req.body.type;
    const level = parseInt(req.body.level) || 2;

    // Find available staff in the same system with matching skills
    let availableStaff = await Staff.find({
      systemId,
      availability: "available",
      skills: emergencyType
    });

    // If no skill match, fall back to any available staff in the system
    if (availableStaff.length === 0) {
      availableStaff = await Staff.find({ systemId, availability: "available" });
    }

    // Assign 1 for level 1, 2 for level 2, all available (max 3) for level 3
    const numToAssign = level === 3 ? Math.min(3, availableStaff.length)
                      : level === 2 ? Math.min(2, availableStaff.length)
                      : Math.min(1, availableStaff.length);

    const assigned = availableStaff.slice(0, numToAssign);

    if (assigned.length > 0) {
      // Save assigned staff to the alert
      alert.assignedStaff = assigned.map(s => s._id.toString());
      alert.assignedStaffNames = assigned.map(s => s.name);
      await alert.save();

      // Mark assigned staff as busy
      await Staff.updateMany(
        { _id: { $in: assigned.map(s => s._id) } },
        { availability: "busy" }
      );
    }

    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALERTS — filtered by systemId
router.get("/alerts", async (req, res) => {
  try {
    const { systemId } = req.query;
    const query = systemId ? { systemId } : {};
    const alerts = await Alert.find(query).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE ALERT STATUS (resolve → release staff back to available)
router.patch("/alert/:id", async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: "Alert not found" });

    alert.status = req.body.status;
    await alert.save();

    // If resolved, set assigned staff back to available
    if (req.body.status === "resolved" && alert.assignedStaff?.length > 0) {
      await Staff.updateMany(
        { _id: { $in: alert.assignedStaff } },
        { availability: "available" }
      );
    }

    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;