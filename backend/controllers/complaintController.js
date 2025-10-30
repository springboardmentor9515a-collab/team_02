const Complaint = require("../model/complaint");
const { uploadImage } = require("../utils/cloudinary");
const { notifyVolunteerAssignment } = require("../utils/notifications");
const User = require("../model/User");
const { validationResult } = require("express-validator");

exports.createComplaint = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  let photo_url = null;
  if (req.file) {
    // For Cloudinary: convert buffer to base64 string
    const fileStr = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;
    const upload = await uploadImage(fileStr);
    photo_url = upload.secure_url;
  }

  const complaint = new Complaint({
    ...req.body,
    photo_url,
    status: "received",
    created_by: req.userid,
  });
  await complaint.save();
  res.json(complaint);
};

exports.getAllComplaints = async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.assigned_to) filter.assigned_to = req.query.assigned_to;
  const complaints = await Complaint.find(filter);
  // populate assigned_to with volunteer name for frontend convenience
  const complaints = await Complaint.find(filter).populate(
    "assigned_to",
    "name"
  );
  res.json(complaints);
};

exports.assignComplaint = async (req, res) => {
  const { id } = req.params;
  const { volunteerId } = req.body;
  const complaint = await Complaint.findByIdAndUpdate(
    id,
    { assigned_to: volunteerId, status: "in_review" },
    { new: true }
  );
  // notify the real volunteer email (if available)
  try {
    const volunteer = await User.findById(volunteerId).select("email name");
    if (volunteer && volunteer.email) {
      await notifyVolunteerAssignment(volunteer.email, complaint._id);
    }
  } catch (err) {
    // don't fail the request if notification fails; log and continue
    console.error("Failed to notify volunteer:", err.message || err);
  }
  res.json(complaint);
};

exports.getVolunteerComplaints = async (req, res) => {
  const complaints = await Complaint.find({ assigned_to: req.userid }).populate(
    "assigned_to",
    "name email"
  );
  res.json(complaints);
};

exports.getMyComplaints = async (req, res) => {
  const complaints = await Complaint.find({ created_by: req.userid }).populate(
    "assigned_to",
    "name email"
  );
  res.json(complaints);
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["in_review", "resolved"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const complaint = await Complaint.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  res.json(complaint);
};
