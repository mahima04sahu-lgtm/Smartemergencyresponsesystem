const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");
const Staff = require("../models/Staff");
const geminiService = require("../services/geminiService");

// CREATE ALERT with AI Analysis and auto-assignment
router.post("/alert", async (req, res) => {
  try {
    const systemId = req.body.systemId || "default";
    const userDescription = req.body.description || "";
    const userLevel = req.body.level || "1";

    // 1. CALL GEMINI AI
    console.log(`--- AI Analyzing: "${userDescription}"`);
    const aiResult = await geminiService.analyzeEmergency(userDescription);
    console.log("--- AI Result:", aiResult);

    // 2. CREATE ALERT OBJECT
    const alert = new Alert({
      ...req.body,
      originalLevel: userLevel,
      aiLevel: aiResult.level,
      aiAdvice: aiResult.advice,
      requiredSkills: aiResult.skillsNeeded
    });

    // 3. SEVERITY CORRECTION: If AI level is higher than user level, upgrade it
    if (aiResult.level && parseInt(aiResult.level) > parseInt(userLevel)) {
      console.log(`>>> AI SEVERITY UPGRADE: ${userLevel} -> ${aiResult.level}`);
      alert.level = aiResult.level;
    }

    await alert.save();

    // --- AUTO-ASSIGN STAFF (Powered by AI Skills) ---
    const emergencyType = req.body.type;
    const finalLevel = parseInt(alert.level) || 2;
    const skillsToMatch = aiResult.skillsNeeded && aiResult.skillsNeeded.length > 0 
                         ? aiResult.skillsNeeded 
                         : [emergencyType];

    // Find available staff in the same system with matching skills
    let availableStaff = await Staff.find({
      systemId,
      availability: "available",
      skills: { $in: skillsToMatch }
    });

    // If no skill match, fall back to any available staff in the system
    if (availableStaff.length === 0) {
      availableStaff = await Staff.find({ systemId, availability: "available" });
    }

    // Assign 1 for level 1, 2 for level 2, all available (max 3) for level 3
    const numToAssign = finalLevel === 3 ? Math.min(3, availableStaff.length)
                      : finalLevel === 2 ? Math.min(2, availableStaff.length)
                      : Math.min(1, availableStaff.length);

    const assigned = availableStaff.slice(0, numToAssign);

    if (assigned.length > 0) {
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
    console.error("Alert creation error:", err);
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