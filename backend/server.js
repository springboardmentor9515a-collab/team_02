// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Protected route
const authMiddleware = require("./middleware/auth");
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: `Hello, ${req.user.id}. You accessed a protected route!`,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
