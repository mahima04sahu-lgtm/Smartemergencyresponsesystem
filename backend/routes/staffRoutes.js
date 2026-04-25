const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");

// GET all staff for a system
router.get("/staff", async (req, res) => {
  try {
    const { systemId } = req.query;
    const query = systemId ? { systemId } : {};
    const staff = await Staff.find(query).select("-password"); // Never send password
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD new staff member
router.post("/staff", async (req, res) => {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    const result = staff.toObject();
    delete result.password; // Remove password from response
    res.json({ success: true, staff: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// STAFF LOGIN
router.post("/staff/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = await Staff.findOne({ email, password }); // Plain text for now
    if (!staff) return res.status(401).json({ error: "Invalid email or password" });

    // Fetch system details to get zones and other config
    const System = require("../models/System");
    const system = await System.findById(staff.systemId);

    const result = staff.toObject();
    delete result.password;
    res.json({ success: true, user: result, system });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE staff availability
router.patch("/staff/:id", async (req, res) => {
  try {
    const updated = await Staff.findByIdAndUpdate(
      req.params.id,
      { availability: req.body.availability },
      { new: true }
    ).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE staff member
router.delete("/staff/:id", async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
