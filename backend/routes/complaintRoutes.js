// backend/routes/complaintRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authmiddleware"); // JWT and role checks
const complaintController = require("../controllers/complaintController");
const multer = require("multer");
const { body } = require("express-validator");

// Multer setup for handling file uploads (memory storage -> buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png"].includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only jpeg/png images allowed"));
  },
});

// Create complaint (citizens)
router.post(
  "/",
  protect,
  authorize("citizen"),
  upload.single("photo"), // parse multipart/form-data
  [
    body("title").isString().notEmpty(),
    body("description").isString().notEmpty(),
    body("category").isString().notEmpty(),
    body("location").isString().notEmpty(),
  ],
  complaintController.createComplaint
);

// Admin: get all complaints (with optional filters)
router.get(
  "/",
  protect,
  authorize("admin"),
  complaintController.getAllComplaints
);

// Citizen: get complaints created by the authenticated user
router.get(
  "/mine",
  protect,
  authorize("citizen", "admin", "volunteer"),
  complaintController.getMyComplaints
);

// Admin: assign complaint to volunteer
router.put(
  "/:id/assign",
  protect,
  authorize("admin"),
  complaintController.assignComplaint
);

// Volunteer: get assigned complaints
router.get(
  "/volunteers/me/complaints",
  protect,
  authorize("volunteer"),
  complaintController.getVolunteerComplaints
);

// Volunteer: update complaint status
router.put(
  "/:id/status",
  protect,
  authorize("volunteer"),
  complaintController.updateStatus
);

module.exports = router;
