const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  location: { type: String, required: true },
  roles: { type: [String], required: true }, 
  skills: { type: [String], required: true }, 
  preferredContact: { type: String, enum: ["Email","none"], default:"none" },
  registrationCompleted: { type: Boolean, default: true }
});

module.exports = mongoose.model("Volunteer", volunteerSchema);
