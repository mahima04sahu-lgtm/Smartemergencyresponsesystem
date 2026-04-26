const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  systemId: { type: String, default: 'default' }, // Which system this alert belongs to
  type: String,
  level: String,
  location: String,
  roomNumber: String,
  description: String,
  reportedBy: String,
  reportedByName: String,
  userRole: String,
  locationId: String,
  reportedAt: String,                               // Added to prevent sync duplication loops
  timestamp: String,                                // Added to prevent sync duplication loops
  originalLevel: String,                            // What the user initially selected
  aiLevel: String,                                  // What AI suggests the level should be
  aiAdvice: String,                                 // Immediate safety instructions from AI
  requiredSkills: { type: [String], default: [] },  // Skills AI thinks are needed
  assignedStaff: { type: [String], default: [] },      // Staff IDs
  assignedStaffNames: { type: [String], default: [] }, // Staff names (for display)

  source: {
    type: String,
    default: "user"
  },

  status: {
    type: String,
    default: "active"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Alert", alertSchema);
