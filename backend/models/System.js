const mongoose = require("mongoose");

const systemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // hotel, hospital, airport, college, etc.
  description: { type: String, default: "" },
  address: { type: String, default: "" },
  zones: { type: [String], default: [] },   // Areas/zones in this system
  accessCode: { type: String, required: true, unique: true }, // Short code to enter system
  adminEmail: { type: String, required: true },
  adminPassword: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("System", systemSchema);
