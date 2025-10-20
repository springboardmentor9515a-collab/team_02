const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, index: true, required: true },
    photo_url: { type: String },
    location: { type: String, required: true },

    raised_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      index: true,
    },
    status: {
      type: String,
      enum: ["received", "in_review", "resolved"],
      default: "received",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
