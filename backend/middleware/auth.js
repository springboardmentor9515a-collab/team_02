// backend/middleware/auth.js
//this file contain logic of login and tokens ,
// if credentiols are correct then it replace heade with actaul token and sent that to server
//else it sends error message
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  // req → the request object
  // res → the response object
  // next → function to pass control to the next middleware or route
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });
  // if token is not found , this message will returned
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
    // if token is wrong, this message will returned.
  }
}

module.exports = auth;
