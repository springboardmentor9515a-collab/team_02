// routes/authRoutes.js
const express = require("express");
const {
  signup,
  signin,
  requestReset,
  resetpassword,
  logout,
} = require("../auth"); // adjust path if needed

const router = express.Router();
const { protect } = require("../middleware/authmiddleware");

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const result = await signup(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Signin route
router.post("/signin", async (req, res) => {
  try {
    const result = await signin(req.body);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user info - validates token via protect
router.get("/me", protect, async (req, res) => {
  try {
    // req.user was populated by protect middleware
    if (!req.user) return res.status(404).json({ error: "User not found" });
    const user = {
      fullName: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout route
router.post("/logout", logout);

// Request password reset
router.post("/requestreset", requestReset);

// Reset password
router.post("/resetpassword", resetpassword);

module.exports = router;
