const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  type: String,
  level: String,
  location: String,
  reportedBy: String,
  userRole: String,

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
