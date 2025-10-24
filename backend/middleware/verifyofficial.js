
const user = require("../model/user");

async function verifyOfficial(req, res, next) {
  try {
    const currentUser = await user.findById(req.userid);
    if (!currentUser) return res.status(404).json({ message: "User not found." });

    if (currentUser.role !== "Official") {
      return res.status(403).json({ message: "Access denied. Only officials can assign petitions." });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Error verifying official", error: err.message });
  }
}

module.exports = verifyOfficial;
