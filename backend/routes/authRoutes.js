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

// Logout route
router.post("/logout", logout);

// Request password reset
router.post("/requestreset", requestReset);

// Reset password
router.post("/resetpassword", resetpassword);

module.exports = router;
