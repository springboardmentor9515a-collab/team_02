const mongo = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const Blacklist = require("./model/blacklist");
require("dotenv").config(); // ✅ Load .env
const nodemailer = require("nodemailer");
const User = require("./model/User");

// ✅ Corrected environment variable name (case-sensitive)
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT secret is not defined");

// ------------------------------
// Reverse Geocoding Helper
// ------------------------------
async function city(lat, long) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;
    const res = await axios.get(url, {
      headers: { "User-Agent": "Infosys/1.0" },
    });
    const address = res.data && res.data.address;
    if (!address) return "unknown";
    return address.city || address.town || address.village || "unknown";
  } catch (err) {
    console.log("City not known:", err?.message || err);
    return "unknown";
  }
}

// ------------------------------
// SIGNUP
// ------------------------------
async function signup({ name, email, password, lat, long, role }) {
  if (!email || !password || !name || !role) {
    throw new Error("Missing required fields");
  }

  let existuser = await User.findOne({ email: email.toLowerCase() });
  if (existuser) throw new Error("User already exists");

  const hashpd = await bcrypt.hash(password, 11);
  const cityname = lat && long ? await city(lat, long) : "unknown";
  let newuser = new User({
    name,
    email: email.toLowerCase(),
    password: hashpd,
    location: cityname,
    role,
  });

  await newuser.save();

  const token = jwt.sign({ id: newuser._id }, secret, { expiresIn: "1h" });
  return { token };
}

// ------------------------------
// SIGNIN
// ------------------------------
async function signin({ email, password }) {
  if (!email || !password) return { error: "Email and password are required" };

  const existuser = await User.findOne({ email: email.toLowerCase() });
  if (!existuser) return { error: "User not exist" };

  const pd = await bcrypt.compare(password, existuser.password);
  if (!pd) return { error: "Incorrect password" };

  const token = jwt.sign({ id: existuser._id }, secret, { expiresIn: "1h" });
  return { token };
}

// ------------------------------
// EMAIL TRANSPORTER
// ------------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // must be App Password or OAuth token
  },
});

// ------------------------------
// PASSWORD RESET EMAIL
// ------------------------------
const sendResetEmail = async (userEmail, userName, resetToken) => {
  const resetLink = `${
    process.env.FRONTEND_URL
  }/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`;

  const mailOptions = {
    from: `"Civix Platform" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Password Reset Request - Civix",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Hi ${userName},</p>
        <p>You requested to reset your password for your Civix account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #4CAF50; 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 5px;
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link in your browser:<br>
          <a href="${resetLink}">${resetLink}</a>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour.<br>
          If you didn't request this, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          Thanks,<br>
          Civix Team
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reset email sent to:", userEmail);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send reset email");
  }
};

// ------------------------------
// REQUEST PASSWORD RESET
// ------------------------------
const requestReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const foundUser = await User.findOne({ email: email.toLowerCase() });

    if (!foundUser) {
      return res.status(200).json({
        success: true,
        message: "If your email exists, you will receive a password reset link",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    foundUser.resetToken = resetToken;
    foundUser.resetTokenExpiry = tokenExpiry;
    await foundUser.save();

    await sendResetEmail(foundUser.email, foundUser.name, resetToken);

    return res.status(200).json({
      success: true,
      message: "If your email exists, you will receive a password reset link",
    });
  } catch (error) {
    console.error("Request reset error:", error);
    return res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// ------------------------------
// RESET PASSWORD
// ------------------------------
const resetpassword = async (req, res) => {
  try {
    let { userEmail, token, newPassword } = req.body;

    if (!userEmail || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, token and new password are required",
      });
    }

    userEmail = userEmail.toLowerCase();

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const foundUser = await User.findOne({
      email: userEmail,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!foundUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    foundUser.password = hashedPassword;
    foundUser.resetToken = null;
    foundUser.resetTokenExpiry = null;
    await foundUser.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login with your new password",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// ------------------------------
// LOGOUT
// ------------------------------
async function logout(req, res) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token required" });

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp)
      return res.status(400).json({ message: "Invalid token" });

    const expiryDate = new Date(decoded.exp * 1000);
    await Blacklist.create({ token, expiry: expiryDate });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
}

module.exports = {
  signin,
  signup,
  User,
  requestReset,
  resetpassword,
  logout,
};
