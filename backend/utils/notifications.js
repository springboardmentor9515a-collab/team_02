const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or another SMTP service
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

exports.sendComplaintConfirmation = async (email, complaintId) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Complaint Submitted",
    text: `Your complaint has been submitted. Complaint ID: ${complaintId}`,
  });
};

exports.notifyVolunteerAssignment = async (email, complaintId) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Complaint Assigned",
    text: `A complaint (ID: ${complaintId}) is assigned to you.`,
  });
};
