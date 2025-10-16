const mongoose = require("mongoose");
const petition=require("../model/petition")
const petitionAssignmentSchema = new mongoose.Schema({
  petitionId: { type: mongoose.Schema.Types.ObjectId, ref: "petition", required: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, 
  status: { type: String, enum: ["assigned", "in_progress", "completed"], default: "assigned" },
  notifyByEmail: { type: Boolean, default: true },
  assignedAt: { type: Date, default: Date.now },
  dueDate: { type: Date }
});

module.exports = mongoose.model("PetitionAssignment", petitionAssignmentSchema);
