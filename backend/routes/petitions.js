const express = require("express");
const Petition = require("../model/petition");
const { protect, authorize } = require("../middleware/authmiddleware");

const router = express.Router();

// POST /api/petitions/:id/comment - Add comment to petition (user or admin)
router.post(
  "/:id/comment",
  protect,
  authorize("citizen", "admin", "official", "volunteer"),
  async (req, res) => {
    try {
      const { text } = req.body;
      if (!text)
        return res.status(400).json({ message: "Comment text required" });
      const petition = await Petition.findById(req.params.id);
      if (!petition)
        return res.status(404).json({ message: "Petition not found" });
      petition.comments.push({ by: req.user._id, text });
      await petition.save();
      res.json({ success: true, comments: petition.comments });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /api/petitions/:id/resolve - Admin resolves petition
router.put(":id/resolve", protect, authorize("admin"), async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition)
      return res.status(404).json({ message: "Petition not found" });
    petition.status = "resolved";
    petition.resolved = true;
    petition.status_history.push({
      status: "resolved",
      by: req.user._id,
      note: req.body.note,
    });
    // If admin provided a comment, add it to comments array
    if (req.body.comment && req.body.comment.trim()) {
      petition.comments.push({ by: req.user._id, text: req.body.comment });
    }
    await petition.save();
    res.json({ success: true, petition });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET /api/petitions - Get all petitions (for admin dashboard)
// Allow all authenticated users to fetch all petitions
router.get("/", protect, async (req, res) => {
  try {
    const filters = {};
    if (req.query.location) filters.location = req.query.location;
    if (req.query.category) filters.category = req.query.category;
    if (req.query.status) filters.status = req.query.status;
    const petitions = await Petition.find(filters).populate(
      "creator assigned_to",
      "name email role"
    );
    res.json(petitions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ✅ Create new petition
router.post(
  "/",
  protect,
  authorize("citizen", "admin", "official"),
  async (req, res) => {
    try {
      const {
        title,
        summary,
        description,
        category,
        location,
        targetAuthority,
        signatureGoal,
      } = req.body;

      // Validate required fields
      if (
        !title ||
        !description ||
        !category ||
        !location ||
        !targetAuthority
      ) {
        return res
          .status(400)
          .json({ message: "All required fields must be provided." });
      }

      // Create petition document
      const petition = await Petition.create({
        creator: req.user._id,
        title,
        summary,
        description,
        category,
        location,
        targetAuthority,
        signatureGoal,
        status_history: [{ status: "active", by: req.user._id }],
      });

      res.status(201).json({ success: true, petition });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Server error while creating petition." });
    }
  }
);

// POST /api/petitions/:id/sign - Citizen signs petition
// Allow all authenticated users to sign/vote petitions
router.post("/:id/sign", protect, async (req, res) => {
  try {
    const p = await Petition.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Petition not found" });

    // Prevent duplicate sign
    if (p.signatures.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You already signed this petition" });
    }

    p.signatures.push(req.user._id);
    p.status_history.push({
      status: "signed",
      by: req.user._id,
      note: "User signed petition",
    });
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/petitions/local - Official views petitions in their area
router.get(
  "/local",
  protect,
  authorize("official", "admin", "citizen", "volunteer"),
  async (req, res) => {
    try {
      const location = req.user.location;
      if (!location)
        return res
          .status(400)
          .json({ message: "Official has no location set" });
      const petitions = await Petition.find({ location }).populate(
        "creator assigned_to",
        "name email role"
      );
      res.json(petitions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /api/petitions/:id/assign - Official assigns petition to volunteer
router.put(
  "/:id/assign",
  protect,
  authorize("official", "admin"),
  async (req, res) => {
    try {
      const { assigned_to, note } = req.body;
      const p = await Petition.findById(req.params.id);
      if (!p) return res.status(404).json({ message: "Petition not found" });

      p.assigned_to = assigned_to;
      p.status = "assigned";
      p.status_history.push({ status: "assigned", by: req.user._id, note });
      await p.save();
      res.json(p);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /api/petitions/:id/volunteer-update - Volunteer adds progress notes
router.put(
  "/:id/volunteer-update",
  protect,
  authorize("volunteer", "admin", "official"),
  async (req, res) => {
    try {
      const { note, status } = req.body;
      const p = await Petition.findById(req.params.id);
      if (!p) return res.status(404).json({ message: "Petition not found" });
      if (
        !p.assigned_to ||
        p.assigned_to.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "Not assigned to you" });
      }

      p.status = status || "under_review";
      p.status_history.push({ status: p.status, by: req.user._id, note });
      await p.save();
      res.json(p);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /api/petitions/:id/respond - Official responds or closes petition
router.put(
  "/:id/respond",
  protect,
  authorize("official", "admin"),
  async (req, res) => {
    try {
      const { official_response, status } = req.body;
      const p = await Petition.findById(req.params.id);
      if (!p) return res.status(404).json({ message: "Petition not found" });

      if (official_response) p.official_response = official_response;
      if (status) p.status = status;
      p.status_history.push({
        status: p.status,
        by: req.user._id,
        note: official_response,
      });
      await p.save();
      res.json(p);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
