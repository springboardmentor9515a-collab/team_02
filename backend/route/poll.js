const express = require("express");
const user= require("../model/user")
const Poll = require("../model/poll");
const Vote = require("../model/vote");
const { verifyUser } = require("../middleware/authmiddleware");
const verifyOfficial = require("../middleware/verifyofficial");

const router = express.Router();

// ✅ Create Poll (Admin/Official)
router.post("/cpoll", verifyUser, verifyOfficial, async (req, res) => {
  try {
    const { title, description, category, options, target_location, duration } = req.body;

    if (!title || !description || !category || !options || options.length < 2 || !target_location || !duration) {
      return res.status(400).json({ message: "All fields are required and at least 2 options needed." });
    }
    const currentUser = await User.findById(req.userid);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const poll = new Poll({
      title,
      description,
      category,
      options,
      created_by: currentUser._id,
      target_location,
      duration,
    });

    await poll.save();
    res.status(201).json({ message: "Poll created successfully", poll });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get all Polls (filter by location)
router.get("/poll", verifyUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userid);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const { target_location } = req.query;
    const filter = target_location ? { target_location } : {};
    const polls = await Poll.find(filter).populate("created_by", "name email");

    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Vote on Poll
router.post("/:id/vote", verifyUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userid);
    if (!currentUser) return res.status(404).json({ message: "User not found." });

    const { id } = req.params;
    const { selected_option } = req.body;

    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (!poll.options.includes(selected_option))
      return res.status(400).json({ message: "Invalid option selected" });

    // Check if user already voted
    const existingVote = await Vote.findOne({ poll_id: id, user_id: currentUser._id });
    if (existingVote) {
      return res.status(400).json({ message: "User has already voted for this poll" });
    }

    const vote = new Vote({
      poll_id: id,
      user_id: currentUser._id,
      selected_option,
    });

    await vote.save();
    res.status(201).json({ message: "Vote recorded successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get Poll Results (aggregated)
router.get("/:id/results", verifyUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userid);
    if (!currentUser) return res.status(404).json({ message: "User not found." });

    const { id } = req.params;
    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const votes = await Vote.aggregate([
      { $match: { poll_id: poll._id } },
      { $group: { _id: "$selected_option", count: { $sum: 1 } } },
    ]);

    const results = {};
    poll.options.forEach((opt) => {
      const found = votes.find((v) => v._id === opt);
      results[opt] = found ? found.count : 0;
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
