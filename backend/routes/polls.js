const express = require("express");
const mongoose = require("mongoose");
const Poll = require("../model/polls");
const Vote = require("../model/vote");
const { protect, authorize } = require("../middleware/authmiddleware");

const router = express.Router();

// POST /api/polls - create poll (official/admin)
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      options,
      target_location,
      targetAuthority,
      description,
      category,
      duration,
    } = req.body;
    if (!title || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        message: "Invalid poll data. Provide title and at least 2 options.",
      });
    }

    const poll = new Poll({
      title,
      description: description || "",
      options,
      category: category || "General",
      duration: duration || 24,
      target_location: target_location || "",
      targetAuthority: targetAuthority || "",
      created_by: req.user._id,
    });
    await poll.save();
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/polls - list polls, optional filter by target_location
router.get("/", protect, async (req, res) => {
  try {
    const q = {};
    if (req.query.target_location)
      q.target_location = req.query.target_location;
    const polls = await Poll.find(q).populate(
      "created_by",
      "name email role location"
    );
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/polls/:id/vote - submit a vote (any authenticated user - enforce one vote per user)
router.post("/:id/vote", protect, async (req, res) => {
  try {
    const pollId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(pollId))
      return res.status(400).json({ message: "Invalid poll id" });
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    // Check if poll has expired
    const createdAt = new Date(poll.createdAt);
    const expiresAt = new Date(
      createdAt.getTime() + poll.duration * 60 * 60 * 1000
    ); // duration is in hours
    if (new Date() > expiresAt) {
      return res.status(400).json({ message: "Poll has expired" });
    }

    const { selected_option } = req.body;
    if (!selected_option || !poll.options.includes(selected_option)) {
      return res.status(400).json({ message: "Invalid option" });
    }

    // check existing vote
    const exists = await Vote.findOne({
      poll_id: poll._id,
      user_id: req.user._id,
    });
    if (exists)
      return res
        .status(409)
        .json({ message: "User already voted on this poll" });

    const vote = new Vote({
      poll_id: poll._id,
      user_id: req.user._id,
      selected_option,
    });
    await vote.save();
    res.status(201).json({ message: "Vote recorded" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/polls/:id/votes - get vote counts for a poll
router.get("/:id/votes", protect, async (req, res) => {
  try {
    const pollId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return res.status(400).json({ message: "Invalid poll id" });
    }

    // Get poll to verify it exists and get options
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Get all votes for this poll
    const votes = await Vote.find({ poll_id: pollId });

    // Count votes for each option
    const voteCounts = {};
    poll.options.forEach((option) => {
      voteCounts[option] = votes.filter(
        (vote) => vote.selected_option === option
      ).length;
    });

    res.json({
      total: votes.length,
      votes: voteCounts,
    });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: "Duplicate vote" });
    res.status(500).json({ message: err.message });
  }
});

// GET /api/polls/:id/results - aggregated counts and percentages
router.get("/:id/results", protect, async (req, res) => {
  try {
    const pollId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(pollId))
      return res.status(400).json({ message: "Invalid poll id" });
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const agg = await Vote.aggregate([
      { $match: { poll_id: poll._id } },
      { $group: { _id: "$selected_option", count: { $sum: 1 } } },
    ]);

    const counts = {};
    let total = 0;
    agg.forEach((a) => {
      counts[a._id] = a.count;
      total += a.count;
    });

    // ensure options present
    poll.options.forEach((opt) => {
      if (!counts[opt]) counts[opt] = 0;
    });

    const percentages = {};
    Object.keys(counts).forEach((k) => {
      percentages[k] = total > 0 ? Math.round((counts[k] / total) * 100) : 0;
    });

    res.json({ counts, percentages, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
