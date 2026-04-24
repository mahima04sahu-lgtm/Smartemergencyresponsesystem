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
