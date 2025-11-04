const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["citizen", "admin", "official", "volunteer"],
    required: true,
  },
  location: { type: String },
  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
});

module.exports = mongoose.model("User", UserSchema);
