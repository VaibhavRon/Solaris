import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from "path";
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Fixed typo here

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // allow us to parse incoming request:req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // allow us to parse incoming cookies

// Load environment variables
dotenv.config();

// Database connection
const dburl = process.env.MONGO_URI;
main().then((res) => {
  console.log("Connection successful to database");
})
.catch((err) => {
  console.log(err);
});

async function main() {
  await mongoose.connect(dburl);
}

// Import routes
import authrouter from "./routes/auth.js";

// Test endpoint to verify API connectivity
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working properly',
    timestamp: new Date().toISOString()
  });
});

// ML model prediction endpoint
app.post('/api/predict', (req, res) => {
  const inputData = req.body.data;
  
  // Spawn a Python process to run the prediction script
  const pythonProcess = spawn('python', [
    path.join(__dirname, 'predict.py'), // Fixed typo here
    JSON.stringify(inputData)
  ]);
  
  let result = '';
  let errorMessage = '';
  
  // Collect data from the Python script
  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });
  
  // Collect any error messages
  pythonProcess.stderr.on('data', (data) => {
    errorMessage += data.toString();
  });
  
  // When the Python process exits
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      // Python script encountered an error
      return res.status(500).json({
        error: true,
        message: `Python script error: ${errorMessage}`
      });
    }
    
    try {
      // Parse the prediction result
      const prediction = JSON.parse(result);
      return res.json({ prediction });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: `Error parsing prediction result: ${error.message}`
      });
    }
  });
});

// Use existing routes
app.use("/api/auth", authrouter);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/auth/dist")));
  
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "auth", "dist", "index.html"));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => { // Listen on all network interfaces
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test the API at: http://localhost:${PORT}/api/test`);
});