const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");

// CREATE ALERT
router.post("/alert", async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALERTS
router.get("/alerts", async (req, res) => {
  const alerts = await Alert.find().sort({ createdAt: -1 });
  res.json(alerts);
});

module.exports = router;