const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["citizen", "official"],
    default: "citizen",
  },
  location: { type: String, required: false },
});

module.exports = mongoose.model("User", UserSchema);
