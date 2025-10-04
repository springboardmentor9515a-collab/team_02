const mongo = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const Blacklist = require("./model/blacklist");
require("dotenv").config();
const nodemailer = require("nodemailer");

const secret = process.env.jwtsecret;
const userschema = new mongo.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  location: { type: String, required: true },
  role: { type: String, enum: ["Citizen", "Official"], required: true },
  otp: { type: Number },
  otpExpiry: { type: Date },
});
const user = mongo.model("user", userschema);

async function city(lat, long) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;
    const res = await axios.get(url, {
      headers: { "User-Agent": "Infosys/1.0" },
    });
    return (
      res.data.address.city ||
      res.data.address.town ||
      res.data.address.village ||
      "unknown"
    );
  } catch (err) {
    console.log("city not known");
    return "unknown";
  }
}

async function signup({ name, email, password, lat, long, role }) {
  let existuser = await user.findOne({ email });
  if (existuser) throw new Error("user already exist");

  const hashpd = await bcrypt.hash(password, 11);
  const cityname = await city(lat, long);
  let newuser = new user({
    name,
    email,
    password: hashpd,
    location: cityname,
    role,
  });
  await newuser.save();
  const token = jwt.sign({ id: newuser._id }, secret, { expiresIn: "1hr" });
  return { token };
}

async function signin({ email, password }) {
  const existuser = await user.findOne({ email });
  if (!existuser) return { error: "user not exist " };

  const pd = await bcrypt.compare(password, existuser.password);
  if (!pd) return { error: "incorrect password" };
  const token = jwt.sign({ id: existuser._id }, secret, { expiresIn: "1hr" });
  return { token };
}

//changes
///////////////////////////
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//reset link logic
const sendResetEmail = async (userEmail, userName, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

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

//forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If your email exists, you will receive a password reset link",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    user.resetToken = resetToken;
    user.resetTokenExpiry = tokenExpiry;
    await user.save();

    await sendResetEmail(user.email, user.name, resetToken);

    return res.status(200).json({
      success: true,
      message: "If your email exists, you will receive a password reset link",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later",
    });
  }
};
//reset password
const resetPassword = async (req, res) => {
  try {
    const { userEmail, token, newPassword } = req.body;
    userEmail = userEmail.toLowerCase();
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

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
  //////////////////

async function logout(req, res) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token required" });

    const decode = jwt.decode(token);
    const expiryDate = new Date(decode.exp * 1000);
    await Blacklist.create({ token, expiry: expiryDate });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
}

module.exports = { signin, signup, user, forgotPassword, resetPassword, logout };

