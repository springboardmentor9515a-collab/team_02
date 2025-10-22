const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authmiddleware");
const User = require("../model/User");

// Admin: list volunteers
router.get("/volunteers", protect, authorize("admin"), async (req, res) => {
  try {
    const volunteers = await User.find({ role: "volunteer" }).select(
      "name email"
    );
    // return array of { id, name }
    const resp = volunteers.map((v) => ({
      id: v._id.toString(),
      name: v.name || v.email || v._id.toString(),
      email: v.email || null,
    }));
    res.json({ volunteers: resp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
