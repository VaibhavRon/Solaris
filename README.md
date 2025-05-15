# ⚡ Grid-Hive: Smart Home Energy Optimization System

Grid-Hive is an AI-powered, microgrid-ready smart home energy management platform designed to optimize energy consumption, enhance sustainability, and ensure fail-safe operation in modern homes and communities. Built on edge-computing with ESP32 and intelligent load prioritization, it enables efficient routing, scheduling, and dynamic control of energy from solar, battery, and the grid.

## 🚀 Key Features

### 🔄 Dynamic Energy Routing
- Seamlessly switch between **solar**, **battery**, and **grid** sources based on availability and cost.
- Real-time wiring-level control using **smart relays**—beyond simple ON/OFF logic.

### 🧠 AI/ML-Based Energy Intelligence
- Predictive modeling of:
  - **Energy generation** (solar, battery levels)
  - **Appliance load demand**
  - **Time-of-day tariff optimization**
- **Behavior-aware scheduling** based on routine detection.

### ⚙️ Load Prioritization & Smart Scheduling
- Prioritize devices based on:
  - **User-defined comfort levels**
  - **Urgency**
  - **Predicted availability**
- Support for **intent-based commands** (e.g., “Charge EV before 6 AM”).

### 🏘️ Microgrid-Ready Architecture
- Scalable to community-level energy sharing.
- Support for **peer-to-peer energy lending** with optional credit/token system.

### 📊 Advanced Web Dashboard
- View day-to-day energy consumption trends.
- Get weekend vs weekday performance insights.
- Visualize **real-time and historical carbon footprint per appliance**.

### 🌱 Real-Time Carbon Footprint Tracking
- Track energy source mix (renewables vs grid).
- Assign and monitor **carbon quotas per appliance**.

### 🌐 Edge-Controlled System (ESP32)
- Low-latency local decisions.
- Offline fallback during outages or cloud failures.
- **Self-healing** behavior in case of anomalies.

### 💡 Adaptive Dim & Hibernation Modes
- Auto-enable dim/hibernation state based on:
  - Room occupancy
  - Time-of-day
  - Current battery/solar conditions

### 🔁 Smart Wiring Reconfiguration
- Dynamic re-routing of circuits via **intelligent relay logic**.
- Predictive circuit reshuffling before overloads or tariff spikes.

### 🛡️ Failsafe Mechanisms
- Emergency overload detection and auto-tripping.
- Grid/supply failure fallback to prioritized backup pathways.
- Pre-emptive alerts with contextual guidance.

---

## 🧪 Novel Differentiators

- **Behavior-Aware Load Management** using ML models.
- **Carbon Budgeting Per Appliance** with gamification potential.
- **Voice/App-based Energy Assistant** for natural queries and scheduling.
- **Programmable Virtual Energy Zones** across rooms/devices.
- **Intent-Driven Scheduling** (e.g., “Minimize cost today”, “Maximize clean energy usage”).

---

## 📦 Tech Stack

- **Frontend**: React.js (Dashboard)
- **Backend**: Node.js / Python + Flask (API + ML models)
- **Hardware**: ESP32 (Edge controller), Smart Relays
- **ML Frameworks**: TensorFlow Lite / scikit-learn
- **Database**: Firebase / SQLite (local), InfluxDB (time series)

---

## 🛠️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/grid-hive.git
   cd grid-hive
