const express = require("express");
const router = express.Router();
const {user:user} = require("../auth");
const Volunteer = require("../model/volunteer");
const Complaint = require("../model/complaint");

const verifyUser = require("../middleware/authmiddleware");
const verifyOfficial = require("../middleware/verifyofficial"); 

router.get("/assignedcomplaints", verifyUser, async (req, res) => {
  try {
    const currentUser = await user.findById(req.userid);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }
    const volunteer = await Volunteer.findOne({ email: currentUser.email });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found." });
    }
    const complaints = await Complaint.find({ assigned_to: volunteer._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ total: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ message: "Error fetching complaints", error: err.message });
  }
});
// Assign a complaint to a volunteer
router.post("/assign-complaint", verifyUser, verifyOfficial, async (req, res) => {
  try {
    const { complaintId, volunteerId } = req.body;

    if (!complaintId || !volunteerId) {
      return res.status(400).json({ message: "complaintId and volunteerId are required." });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found." });
    }

    complaint.assigned_to = volunteer._id;
    complaint.status = "in_review";
    await complaint.save();

    res.status(200).json({
      message: `Complaint "${complaint.title}" assigned to ${volunteer.name || volunteer.email}.`,
      complaint,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error assigning complaint.",
      error: err.message,
    });
  }
});

// Create a new complaint
router.post("/create-complaint", verifyUser, async (req, res) => {
  try {
    const { title, description, category, location, photo_url } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

     const currentUser = await user.findById(req.userid);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

     const existingComplaint = await Complaint.findOne({ "raised_by": currentUser._id });
    if (existingComplaint) {
      return res.status(400).json({
        message: "You have already raised a complaint. You can only raise one complaint."
      });
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      location,
      photo_url,
      raised_by: currentUser._id, 
      status: "received"
    });
    await complaint.save();

    res.status(201).json({ message: "Complaint created successfully", complaint });
  } catch (err) {
    res.status(500).json({ message: "Error creating complaint", error: err.message });
  }
});

module.exports = router;
