import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db.js'; // Assumes db.js is in the same folder
import authRoutes from './routes/auth.js'; // Assumes routes/auth.js exists

// Load environment variables from the .env file
dotenv.config();

// Initialize the database connection (as seen in your db.js image)
connectDB(); 

const app = express();

// Middleware
app.use(express.json()); // Allows the server to accept JSON data from the frontend

// Routes
app.use('/api/auth', authRoutes); 

// Fallback test route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Use the PORT variable you got from the .env file (5000)
const PORT = process.env.PORT || 8000; 

app.listen(PORT, () => {
    console.log('Server running in development mode on port${PORT}');
});