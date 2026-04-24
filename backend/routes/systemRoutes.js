const express = require("express");
const router = express.Router();
const System = require("../models/System");
const Staff = require("../models/Staff");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

// AI ZONE GENERATOR
router.post("/ai/generate-zones", async (req, res) => {
  console.log(">>> AI REQUEST RECEIVED for:", req.body.type);
  try {
    const { type, description } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Act as an emergency response architect. Based on this system type: "${type}" and description: "${description}", suggest a list of 6-10 specific physical zones or areas where emergencies can be reported. Return ONLY the zones as a comma-separated string. No other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to get an array
    const zones = text.split(",")
      .map(z => z.trim())
      .filter(z => z.length > 0);

    res.json({ zones });
  } catch (err) {
    console.error("--- GEMINI AI ERROR ---");
    console.error("Status:", err.status);
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ error: "Failed to generate zones" });
  }
});

// CREATE a new system
router.post("/system", async (req, res) => {
  console.log("Creating new system:", req.body.name);
  try {
    const { name, type, description, address, zones, adminEmail, adminPassword } = req.body;

    // Generate a unique 6-char access code
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const system = new System({
      name, type, description, address, zones,
      adminEmail, adminPassword,
      accessCode
    });
    await system.save();

    // Also create the admin as a staff member
    await Staff.create({
      name: adminEmail.split("@")[0], // Use email prefix as name if not provided
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      skills: [],
      availability: "available",
      systemId: system._id.toString()
    });

    res.json({ success: true, systemId: system._id, accessCode, system });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ENTER system by access code
router.get("/system/enter/:code", async (req, res) => {
  try {
    const system = await System.findOne({ accessCode: req.params.code.toUpperCase() });
    if (!system) return res.status(404).json({ error: "System not found" });
    res.json({ success: true, systemId: system._id, system });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET system details by ID
router.get("/system/:id", async (req, res) => {
  try {
    const system = await System.findById(req.params.id);
    if (!system) return res.status(404).json({ error: "System not found" });
    res.json(system);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
