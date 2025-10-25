const mongoose = require("mongoose");

const PollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Poll title is required."],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Poll description is required."],
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length >= 2;
      },
      message: "Poll must have at least two options."
    }
  },
  category: {
    type: String,
    required: [true, "Category is required."],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, "Duration is required."],
    min: [1, "Duration must be at least 1 hour/day."]
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  target_location: {
    type: String,
    required: [true, "Target location is required."],
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Poll", PollSchema);
