// index.js
const mongo = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const {
  signin,
  signup,
  User,
  requestReset,
  resetpassword,
  logout,
} = require("./auth");
require("dotenv").config();
const cors = require("cors");
const route = express();
const verifyUser = require("./middleware/authmiddleware");

route.use(cors());
route.use(express.json());

const mongoUri =
  process.env.MONGODB_URI || process.env.MONGODB || process.env.mongourl;
if (!mongoUri) {
  console.error("MongoDB URI not defined in environment (MONGODB_URI).");
  process.exit(1);
}

mongo
  .connect(mongoUri)
  .then(() => console.log("mongodb connected"))
  .catch((e) => {
    console.error("MongoDB connection error:", e);
    process.exit(1);
  });

const secret = process.env.jwtsecret;
if (!secret) {
  console.error("JWT secret is not defined");
  process.exit(1);
}

route.post("/signup", async (req, res) => {
  try {
    const signedup = await signup(req.body);
    res.json(signedup);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(400).json({ error: err.message || "Try again later" });
  }
});

route.post("/signin", async (req, res) => {
  try {
    const signedin = await signin(req.body);

    if (signedin.error) {
      return res.status(400).json({ error: signedin.error });
    }
    res.json(signedin);
  } catch (err) {
    console.error("Signin error:", err);
    res.status(400).json({ error: "Try again later" });
  }
});

route.post("/requestreset", async (req, res) => {
  try {
    await requestReset(req, res);
  } catch (err) {
    console.error("Request reset error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

route.post("/resetpassword", async (req, res) => {
  try {
    await resetpassword(req, res);
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

route.get("/dashboard", verifyUser, async (req, res) => {
  try {
    const currentuser = await User.findById(req.userid).select("-password");
    if (!currentuser) return res.status(400).json({ error: "user not found" });
    res.json(currentuser);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "server error" });
  }
});

route.delete("/deleteuser", verifyUser, async (req, res) => {
  try {
    const userId = req.userid;
    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
});

route.post("/logout", logout);

const PORT = process.env.PORT || 5000;
route.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
