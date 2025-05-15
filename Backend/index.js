import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from "path";
import fetch from 'node-fetch';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware - Enhanced CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL // Use environment variable for production
    : ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Environment variables
dotenv.config();
const dburl = process.env.MONGO_URI;
const ESP32_URL = process.env.ESP32_URL || 'http://192.168.140.203';

// Database connection
main().then(() => {
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

// API Routes
app.use("/api/auth", authrouter);

// Test endpoint to verify API connectivity
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working properly',
    timestamp: new Date().toISOString()
  });
});

// ESP32 API proxy routes
app.get("/api/esp32/data", async (req, res) => {
  try {
    const response = await fetch(`${ESP32_URL}/data`);
    if (!response.ok) {
      throw new Error(`ESP32 returned ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching ESP32 data:", error);
    res.status(500).json({ error: "Failed to fetch data from ESP32" });
  }
});

// Route to toggle relays
app.post("/api/esp32/toggle/:id", async (req, res) => {
  const relayId = req.params.id;
  try {
    const response = await fetch(`${ESP32_URL}/toggle${relayId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`ESP32 returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Error toggling relay ${relayId}:`, error);
    res.status(500).json({ error: `Failed to toggle relay ${relayId}` });
  }
});

// Emergency shutdown route
app.post("/api/esp32/shutdown", async (req, res) => {
  try {
    const response = await fetch(`${ESP32_URL}/shutdown`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`ESP32 returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error executing emergency shutdown:", error);
    res.status(500).json({ error: "Failed to execute emergency shutdown" });
  }
});

// ML model prediction endpoint
app.post('/api/predict', (req, res) => {
  const inputData = req.body.data;
  
  // Spawn a Python process to run the prediction script
  const pythonProcess = spawn('python', [
    path.join(__dirname, 'predict.py'),
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