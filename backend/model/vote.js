const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema(
  {
    poll_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    selected_option: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// ensure one vote per user per poll
VoteSchema.index({ poll_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("Vote", VoteSchema);
