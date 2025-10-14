// backend/routes/complaints.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth"); // JWT and role checks
const complaintController = require("../controllers/complaintController");

router.post(
  "/",
  protect,
  authorize("citizen"),
  complaintController.createComplaint
);
router.get(
  "/",
  protect,
  authorize("admin"),
  complaintController.getAllComplaints
); // with filters
router.put(
  "/:id/assign",
  protect,
  authorize("admin"),
  complaintController.assignComplaint
);
router.get(
  "/volunteers/me/complaints",
  protect,
  authorize("volunteer"),
  complaintController.getAssignedComplaints
);
router.put(
  "/:id/status",
  protect,
  authorize("volunteer"),
  complaintController.updateStatus
); // optional

module.exports = router;
