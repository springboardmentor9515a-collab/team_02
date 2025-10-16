const express = require("express");
const router = express.Router();
const {user:user} = require("../auth");
const Volunteer = require("../model/volunteer");
const Complaint = require("../model/complaint");
const { sendEmail } = require("../auth"); 
const verifyUser = require("../middleware/authmiddleware");
const verifyOfficial = require("../middleware/verifyofficial"); 

router.get("/assignedcomplaints", verifyUser, async (req, res) => {
  try {
    // Step 1: Get the logged-in user using token info
    const currentUser = await user.findById(req.userid);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Step 2: Find volunteer profile linked to the user’s email
    const volunteer = await Volunteer.findOne({ email: currentUser.email });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found." });
    }

    // Step 3: Get all complaints assigned to this volunteer
    const complaints = await Complaint.find({ assigned_to: volunteer._id })
      .sort({ createdAt: -1 });

    // Step 4: Return results
    res.status(200).json({ total: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ message: "Error fetching complaints", error: err.message });
  }
});
// Create a new complaint
router.post("/create-complaint", verifyUser, async (req, res) => {
  try {
    const { title, description, category, location, photo_url } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Optionally link volunteer (if needed, can be assigned later)
    const currentUser = await Volunteer.findOne({ email: req.userEmail });

    const complaint = new Complaint({
      title,
      description,
      category,
      location,
      assigned_to: currentUser ? currentUser._id : undefined,
      photo_url
    });

    await complaint.save();

    res.status(201).json({ message: "Complaint created successfully", complaint });
  } catch (err) {
    res.status(500).json({ message: "Error creating complaint", error: err.message });
  }
});

module.exports = router;
