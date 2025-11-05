const express = require("express");
const Petition = require("../model/petition");
const Vote = require("../model/vote");
const Poll = require("../model/polls");
const Complaint = require("../model/complaint");
const { protect, authorize } = require("../middleware/authmiddleware");
const natural = require("natural");
const router = express.Router();

// Initialize sentiment analyzer
const analyzer = new natural.SentimentAnalyzer(
  "English",
  natural.PorterStemmer,
  "afinn"
);

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

// GET /api/reports/sentiment - Get sentiment analysis for an entity (complaint/petition/poll)
router.get("/sentiment/:type/:id", protect, async (req, res) => {
  try {
    let entity;
    const { type, id } = req.params;

    switch (type) {
      case "complaints":
        entity = await Complaint.findById(id).populate(
          "comments.by",
          "name email"
        );
        break;
      case "petitions":
        entity = await Petition.findById(id).populate(
          "comments.by",
          "name email"
        );
        break;
      case "polls":
        entity = await Poll.findById(id).populate("comments.by", "name email");
        break;
      default:
        return res.status(400).json({ message: "Invalid entity type" });
    }

    if (!entity) {
      return res
        .status(404)
        .json({ message: `${type.slice(0, -1)} not found` });
    }

    // Analyze sentiment for the entity text and comments
    let results = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    // Analyze main text
    const mainText = entity.description || entity.question || "";
    const mainSentiment = analyzer.getSentiment(mainText.split(" "));
    if (mainSentiment > 0) results.positive++;
    else if (mainSentiment < 0) results.negative++;
    else results.neutral++;

    // Analyze comments
    if (entity.comments) {
      entity.comments.forEach((comment) => {
        const sentiment = analyzer.getSentiment(comment.text.split(" "));
        if (sentiment > 0) results.positive++;
        else if (sentiment < 0) results.negative++;
        else results.neutral++;
      });
    }

    // Calculate total and percentages
    const total = results.positive + results.negative + results.neutral;
    const percentages = {
      positive: Math.round((results.positive / total) * 100) || 0,
      negative: Math.round((results.negative / total) * 100) || 0,
      neutral: Math.round((results.neutral / total) * 100) || 0,
    };

    res.json({
      results,
      percentages,
      total,
      type,
      entityId: id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/sentiment - Aggregate sentiment across petitions, polls, and complaints
router.get(
  "/sentiment",
  protect,
  authorize("official", "admin"),
  async (req, res) => {
    try {
      // load a sample of documents from each collection to analyze
      const petitions = await Petition.find().limit(200).lean();
      const polls = await Poll.find().limit(200).lean();
      const complaints = await Complaint.find().limit(200).lean();

      let results = { positive: 0, negative: 0, neutral: 0 };

      const analyzeText = (text) => {
        if (!text || typeof text !== "string") return;
        const score = analyzer.getSentiment(text.split(" "));
        if (score > 0) results.positive++;
        else if (score < 0) results.negative++;
        else results.neutral++;
      };

      // analyze petitions (title, summary, description and comments)
      petitions.forEach((p) => {
        analyzeText(p.title);
        analyzeText(p.summary);
        analyzeText(p.description);
        if (Array.isArray(p.comments))
          p.comments.forEach((c) => analyzeText(c.text));
      });

      // analyze polls (question/description and comments)
      polls.forEach((p) => {
        analyzeText(p.question || p.title || p.description || "");
        if (Array.isArray(p.comments))
          p.comments.forEach((c) => analyzeText(c.text));
      });

      // analyze complaints (title/description and comments)
      complaints.forEach((c) => {
        analyzeText(c.title);
        analyzeText(c.description);
        if (Array.isArray(c.comments))
          c.comments.forEach((cm) => analyzeText(cm.text));
      });

      const total = results.positive + results.negative + results.neutral;
      const percentages = {
        positive: Math.round((results.positive / (total || 1)) * 100),
        negative: Math.round((results.negative / (total || 1)) * 100),
        neutral: Math.round((results.neutral / (total || 1)) * 100),
      };

      res.json({ results, percentages, total, type: "aggregate" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

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
