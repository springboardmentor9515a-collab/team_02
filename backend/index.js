// index.js
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const complaintRoutes = require("./routes/complaintRoutes");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use("/api/complaints", complaintRoutes);

//auth
const authRoutes = require("./routes/authRoutes");

// Auth routes
app.use("/api/auth", authRoutes);

// User routes (admin operations)
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Test route — this must have a valid function as 2nd argument
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
