// auth.js
const mongo = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const Blacklist = require("./model/blacklist");
require("dotenv").config();
const nodemailer = require("nodemailer");
const User = require("./model/User");

const secret = process.env.jwtsecret;

// Safe reverse geocoding - guard address existence
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
    console.log("city not known", err?.message || err);
    return "unknown";
  }
}

async function signup({ name, email, password, lat, long, role }) {
  if (!email || !password || !name || !role) {
    throw new Error("Missing required fields");
  }

  let existuser = await User.findOne({ email: email.toLowerCase() });
  if (existuser) throw new Error("user already exist");

  const hashpd = await bcrypt.hash(password, 11);
  const cityname = lat && long ? await city(lat, long) : "unknown";
  let newuser = new User({
    name,
    email: email.toLowerCase(),
    password: hashpd,
    location: cityname,
    role: role,
  });
  await newuser.save();
  // include role in the JWT payload; use proper jwt.sign signature
  const token = jwt.sign({ id: newuser._id, role: newuser.role }, secret, {
    expiresIn: "3h",
  });
  return { token };
}

async function signin({ email, password }) {
  if (!email || !password) return { error: "email and password are required" };

  const existuser = await User.findOne({ email: email.toLowerCase() });
  if (!existuser) return { error: "user not exist" };

  const pd = await bcrypt.compare(password, existuser.password);
  if (!pd) return { error: "incorrect password" };
  const token = jwt.sign({ id: existuser._id, role: existuser.role }, secret, {
    expiresIn: "3h",
  });
  // return token and basic user info for frontend convenience
  return {
    token,
    user: {
      fullName: existuser.name,
      email: existuser.email,
      role: existuser.role,
    },
  };
}

// Nodemailer transporter - use JSON transport in development to avoid real email
const transporter =
  process.env.NODE_ENV === "development"
    ? nodemailer.createTransport({ jsonTransport: true })
    : nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // should be an app password or OAuth token
        },
      });

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

// requestReset - used by index.js route /requestreset
const requestReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
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
    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later",
    });
  }
};

// resetpassword - used by index.js route /resetpassword
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
      message:
        "Password reset successful. You can now login with your new password",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later",
    });
  }
};

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
