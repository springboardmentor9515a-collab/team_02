const mongoose = require("mongoose");
const NotificationLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String }, // e.g. 'complaint_confirmation', 'assignment'
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("NotificationLog", NotificationLogSchema);
