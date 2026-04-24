const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["staff", "admin"], default: "staff" },
  department: { type: String, default: "" },
  skills: { type: [String], default: [] }, // medical, fire, security, maintenance, etc.
  availability: { type: String, enum: ["available", "busy"], default: "available" },
  locationId: { type: String, default: "" },
  systemId: { type: String, required: true }, // Which system/organization they belong to
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Staff", staffSchema);
