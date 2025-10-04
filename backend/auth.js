const mongo = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
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

//change

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}

async function requestReset(req, res) {
  const { email } = req.body;
  const u = await user.findOne({ email });
  if (!u) return res.status(404).json({ error: "User not found" });

  const otp = generateOtp();
  u.otp = otp;
  u.otpExpiry = Date.now() + 10 * 60 * 1000;
  await u.save();

  await sendOtpEmail(email, otp);
  res.json({ message: "OTP sent to your email" });
}
async function sendOtpEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
      user: "apikey",
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: `<p>you otp is <b>${otp}</b>. The otp is valid for 1 hour.</p>`,
  });
}

async function resetpassword(req, res) {
  const { email, otp, newPassword } = req.body;
  const u = await user.findOne({ email });

  if (!u || u.otp !== otp || u.otpExpiry < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  u.password = await bcrypt.hash(newPassword, 11);
  u.otp = undefined;
  u.otpExpiry = undefined;
  await u.save();

  res.json({ message: "Password has been reset successfully" });
}
//

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

module.exports = { signin, signup, user, requestReset, resetpassword, logout };
