const express = require("express");
const mongo=require("mongoose")
const bcrypt=require("bcrypt")
const route = express.Router();
const verifyUser = require("../middleware/authmiddleware");
const {user:user} = require("../auth");
const petition = require("../model/petition"); 
const Volunteer = require("../model/volunteer");
const signature=require("../model/signature")
const petitionAssignment = require("../model/assignment"); 
const complaintRoutes = require("../route/complaint");
const { sendEmail } = require("../auth"); 
const verifyOfficial=require("../middleware/verifyofficial")

//create a petition
route.post("/cpetition", verifyUser, async (req, res) => {
  try {
    const { title, description, category, signatureGoal, targetAuthority, summary } = req.body;

    if (!title || !description || !category || !signatureGoal || !targetAuthority || !summary) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const currentUser = await user.findById(req.userid);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

  
    const p = new petition({
      creator: currentUser._id,
      title,
      description,
      category,
      summary,
      signatureGoal,
      targetAuthority,
      location: currentUser.location,
    });

    await p.save();

    res.status(201).json({
      message: "Petition created successfully!",
      petition: p,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating petition",
      error: err.message,
    });
  }
});

//get a petition 
route.get("/allpetition", verifyUser, async (req, res) => {
  try {
    const currentUser = await user.findById(req.userid);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const { category, status } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;


    if (currentUser.location && currentUser.location.trim() !== "") {
      filter.location = currentUser.location;
    }

    console.log("Filter being used:", filter); 

    const petitions = await petition.find(filter)
      .populate("creator", "name email role location")
      .sort({ createdAt: -1 });

    res.json(petitions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching petitions", error: err.message });
  }
});

//edit petition
route.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { creator, title, description, category, location } = req.body;

    const petition = await petition.findById(id);
    if (!petition) return res.status(404).json({ message: "Petition not found" });

    if (petition.creator.toString() !== creator) {
      return res.status(403).json({ message: "Unauthorized: only creator can edit" });
    }

    if (petition.status !== "active") {
      return res.status(400).json({ message: "Petition cannot be edited once under review or closed" });
    }

    petition.title = title || petition.title;
    petition.description = description || petition.description;
    petition.category = category || petition.category;
    petition.location = location || petition.location;

    await petition.save();
    res.json({ message: "Petition updated successfully!", petition });
  } catch (err) {
    res.status(500).json({ message: "Error updating petition", error: err.message });
  }
});

//sign a petition 
route.post("/sign/:petitionId", async (req, res) => {
  try {
    const { petitionId } = req.params;
    const { userId } = req.body;

    const petition = await petition.findById(petitionId);
    if (!petition) return res.status(404).json({ message: "Petition not found" });
    if (petition.status !== "active")
      return res.status(400).json({ message: "Petition not open for signing" });

    const existingSignature = await Signature.findOne({ petition: petitionId, user: userId });
    if (existingSignature)
      return res.status(400).json({ message: "User already signed this petition" });

    const signature = new Signature({
      petition: petitionId,
      user: userId,
    });

    await signature.save();
    res.status(201).json({ message: "Petition signed successfully!", signature });
  } catch (err) {
    res.status(500).json({ message: "Error signing petition", error: err.message });
  }
});

route.post("/assign-petition", verifyUser, verifyOfficial, async (req, res) => {
  try {
    const { petitionId, volunteerId, notifyByEmail, dueDate } = req.body;

    if (!petitionId || !volunteerId) {
      return res.status(400).json({ message: "petitionId and volunteerId are required." });
    }
    const petitiond = await petition.findById(petitionId);
    if (!petitiond) return res.status(404).json({ message: "Petition not found." });
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found." });

    const existingAssignmentForPetition = await petitionAssignment.findOne({ petitionId });
    if (existingAssignmentForPetition) {
      return res.status(400).json({ message: "This petition is already assigned to a volunteer." });
    }

    const existingAssignmentForVolunteer = await petitionAssignment.findOne({ petitionId, volunteerId });
    if (existingAssignmentForVolunteer) {
      return res.status(400).json({ message: "This volunteer is already assigned to this petition." });
    }
    const assignment = new petitionAssignment({
      petitionId,
      volunteerId,
      assignedBy: req.userid, 
      notifyByEmail: notifyByEmail !== undefined ? notifyByEmail : true,
      dueDate
    });

    await assignment.save();

    if (assignment.notifyByEmail) {
      sendEmail(volunteer.email, "New Petition Assigned", `You have been assigned to petition: ${petitiond.title}`);
    }

    res.status(201).json({ message: "Petition assigned successfully!", assignment });
  } catch (err) {
    res.status(500).json({ message: "Error assigning petition", error: err.message });
  }
});

route.get("/petition/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const foundPetition = await petition.findById(id)
      .populate("creator", "name email role");

    if (!foundPetition) return res.status(404).json({ message: "Petition not found" });

    const signaturesCount = await signature.countDocuments({ petition: id });
    res.json({ petition: foundPetition, totalSignatures: signaturesCount });
  } catch (err) {
    res.status(500).json({ message: "Error fetching petition", error: err.message });
  }
});
route.get("/volunteer-petitions", verifyUser, async (req, res) => {
  try {

    const currentUser = await user.findById(req.userid);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const volunteer = await Volunteer.findOne({ email: currentUser.email });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found." });
    }

    const assignments = await petitionAssignment.find({ volunteerId: volunteer._id })
      .populate("petitionId", "title description category location status creator")
      .populate("assignedBy", "name email role") 
      .sort({ assignedAt: -1 });

   
    res.status(200).json({ assignments });
  } catch (err) {
    console.error("Error in /volunteer-petitions:", err);
    res.status(500).json({ message: "Error fetching assignments", error: err.message });
  }
});
module.exports=route;
