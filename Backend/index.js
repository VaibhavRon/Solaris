import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from "path";
import fetch from 'node-fetch'; // Add this for server-side requests

const app = express();
const __dirname = path.resolve();

// Expanded CORS to allow requests from your frontend regardless of environment
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL // Use environment variable for production
    : "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Environment variables
dotenv.config();
const dburl = process.env.MONGO_URI;
const ESP32_URL = process.env.ESP32_URL || 'http://192.168.140.203'; // Configure via env var

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
app.post("/api/esp32/toggle:id", async (req, res) => {
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

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/auth/dist")));
  
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "auth", "dist", "index.html"));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});