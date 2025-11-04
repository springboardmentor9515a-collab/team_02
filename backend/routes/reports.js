const express = require("express");
const Petition = require("../model/petition");
const Vote = require("../model/vote");
const Poll = require("../model/polls");
const { protect, authorize } = require("../middleware/authmiddleware");
const router = express.Router();

// simple CSV stringify helper (header from object keys)
function stringifyRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const keys = Object.keys(rows[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const header = keys.join(",");
  const lines = rows.map((r) => keys.map((k) => escape(r[k])).join(","));
  return header + "\n" + lines.join("\n");
}

// GET /api/reports/engagement - monthly counts for past 12 months
router.get(
  "/engagement",
  protect,
  authorize("official", "admin"),
  async (req, res) => {
    try {
      const now = new Date();
      const past = new Date(now);
      past.setMonth(now.getMonth() - 11);

      const petitions = await Petition.aggregate([
        { $match: { createdAt: { $gte: past } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      const votes = await Vote.aggregate([
        { $match: { createdAt: { $gte: past } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      res.json({ petitions, votes });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/reports/export - return CSV strings for petitions and polls
router.get(
  "/export",
  protect,
  authorize("official", "admin"),
  async (req, res) => {
    try {
      const petitions = await Petition.find()
        .populate("creator assigned_to", "name email")
        .lean();
      const polls = await Poll.find()
        .populate("created_by", "name email")
        .lean();

      const petitionRows = petitions.map((p) => ({
        id: p._id,
        title: p.title,
        creator: p.creator?.email || "",
        assigned_to: p.assigned_to?.email || "",
        status: p.status,
        location: p.location,
        createdAt: p.createdAt,
      }));

      const pollRows = polls.map((p) => ({
        id: p._id,
        title: p.title,
        created_by: p.created_by?.email || "",
        options: JSON.stringify(p.options),
        target_location: p.target_location,
        createdAt: p.createdAt,
      }));

      const petitionCsv = stringifyRows(petitionRows);
      const pollCsv = stringifyRows(pollRows);

      res.json({ petitions_csv: petitionCsv, polls_csv: pollCsv });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
