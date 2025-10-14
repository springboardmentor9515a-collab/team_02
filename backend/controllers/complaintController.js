const Complaint = require("../model/Complaint");
const { uploadImage } = require("../utils/cloudinary");
const {
  sendComplaintConfirmation,
  notifyVolunteerAssignment,
} = require("../utils/notifications");
const { uploadImage } = require("../utils/cloudinary");

exports.createComplaint = async (req, res) => {
  // Validate/sanitize inputs as needed
  let photo_url = null;
  if (req.file) {
    // Validate file here (size/type)
    const upload = await uploadImage(req.file.path);
    photo_url = upload.secure_url;
  }
  const complaint = new Complaint({
    ...req.body,
    photo_url,
    status: "received",
  });
  await complaint.save();
  await sendComplaintConfirmation(req.user.email, complaint._id); // Requires user's email
  res.json(complaint);
};

exports.getAllComplaints = async (req, res) => {
  // Filters by category, status, assigned_to
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.assigned_to) filter.assigned_to = req.query.assigned_to;
  const complaints = await Complaint.find(filter);
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
  // Retrieve volunteer email based on ID, then:
  await notifyVolunteerAssignment("volunteer@email.com", complaint._id);
  res.json(complaint);
};

exports.getAssignedComplaints = async (req, res) => {
  const complaints = await Complaint.find({ assigned_to: req.userid });
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

exports.createComplaint = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  let photo_url = null;
  if (req.file) {
    // Convert buffer to base64 for Cloudinary (if needed)
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
  });
  await complaint.save();
  // other logic (notifications, etc.)
  res.json(complaint);
};
