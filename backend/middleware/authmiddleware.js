const jwt = require("jsonwebtoken");
require("dotenv").config();
const Blacklist = require("../model/blacklist");
const User = require("../model/User"); // Update path if needed
const secret = process.env.jwtsecret;

async function protect(req, res, next) {
  try {
    const header = req.headers["authorization"];
    if (!header) {
      console.error("[AUTH] No token received");
      throw new Error("No token received");
    }
    const token = header.split(" ")[1];
    console.log("[AUTH] Token received:", token);
    console.log("[AUTH] JWT Secret:", secret);
    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) {
      console.error("[AUTH] Token is blacklisted");
      return res.status(401).json({ message: "Token is invalidated" });
    }
    jwt.verify(token, secret, async (err, decoded) => {
      if (err) {
        console.error("[AUTH] JWT verify error:", err);
        return res.status(401).json({ message: "Invalid token" });
      }
      console.log("[AUTH] Decoded JWT:", decoded);
      req.userid = decoded.id;
      const user = await User.findById(decoded.id).select("name email role");
      console.log("[AUTH] User found:", user);
      if (!user) {
        console.error("[AUTH] User not found for id:", decoded.id);
        return res.status(404).json({ message: "User not found" });
      }
      req.user = user;
      next();
    });
  } catch (err) {
    console.error("[AUTH] Exception:", err);
    res.status(401).json({ message: err.message });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Role not authorized" });
    }
    next();
  };
}

module.exports = { protect, authorize };
