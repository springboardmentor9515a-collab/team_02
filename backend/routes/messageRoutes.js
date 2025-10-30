const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Message = require("../model/Message");

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// 📩 Send a new message
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "Receiver ID and content required" });
    }

    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content,
    });

    await message.save();
    res.status(201).json({ message: "Message sent successfully", data: message });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 💬 Get conversation between two users
router.get("/conversation/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id },
      ],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
