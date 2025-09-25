// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  // req → the request object
  // res → the response object
  // next → function to pass control to the next middleware or route
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = auth;
