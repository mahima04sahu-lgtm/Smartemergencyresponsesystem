const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  type: String,
  level: String,
  location: String,
  roomNumber: String,
  description: String,        // ← THE MISSING FIELD
  reportedBy: String,
  reportedByName: String,
  userRole: String,
  locationId: String,

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
