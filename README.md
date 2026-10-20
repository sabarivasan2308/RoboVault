# ⚡ RoboVault — Robotics Lab Asset & Maintenance Management Platform

[![CI/CD Pipeline](https://github.com/your-username/robovault/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/robovault/actions)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

A centralized full-stack web platform built for university robotics laboratories, mechatronics facilities, and embedded systems research groups. RoboVault replaces manual paper logs and chaotic spreadsheets with an institutional asset management and equipment custody system.

---

## 📌 System Architecture

```text
Browser Client (React.js SPA)
       │
       ▼ (REST API / JSON)
Spring Boot Backend (Port 8080)
       │  Controllers ➔ Services ➔ Repositories
       ▼
MongoDB Database (Port 27017)
       │
       ▼
Docker Volume (`mongo_data:/data/db`) ➔ Persistent Storage
```

### Docker Network Architecture

```text
               ┌───────────────────────────────┐
               │          Docker Host          │
               │   Network: `robovault-net`    │
               └──────────────┬────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ React Frontend   │ │ Spring Boot API  │ │ MongoDB Server   │
│ Port 3000 (Nginx)│ │ Port 8080 (JRE)  │ │ Port 27017       │
└──────────────────┘ └──────────────────┘ └────────┬─────────┘
                                                   │
                                                   ▼
                                        Docker Volume: `mongo_data`
```

---

## 🚀 Key Modules & Capabilities

1. **Dashboard & Telemetry**: Real-time KPI cards for *Total Assets, Available, In Use, Maintenance, Damaged, and Overdue* along with a live laboratory activity feed.
2. **Asset Lifecycle Tracking**: Full inventory tracking across 12 hardware categories (Microcontrollers, Development Boards, Sensors, Motors, Motor Drivers, Robotics Kits, 3D Printers, etc.) with serial numbers, rack locations, and condition health.
3. **Multi-Stage Checkout Flow**:
   $$\text{Select Equipment} \longrightarrow \text{Request} \longrightarrow \text{Admin Approval} \longrightarrow \text{Issue} \ (\text{IN\_USE}) \longrightarrow \text{Return} \longrightarrow \text{Condition Check} \longrightarrow \text{AVAILABLE}$$
4. **Maintenance & Calibration**:
   $$\text{Fault Report} \longrightarrow \text{Diagnosis} \longrightarrow \text{Repair / Parts} \longrightarrow \text{Resolved} \longrightarrow \text{Closed}$$
5. **Project Allocation**: Bind sensor kits, motor drivers, and SBCs directly to research teams (e.g. *Autonomous Delivery Robot*, *Quadcopter Drone*).
6. **Fault Reporting**: Incident reporting with severity classification (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and one-click dispatch to the maintenance queue.
7. **Role-Based Workflows**: Administrator (full control), Lab Assistant (issue/receive and repair), Student / Researcher (search, request, and report).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, JavaScript ES6+, Axios, Custom CSS3 Design System, Nginx |
| **Backend** | Java 17, Spring Boot 3.2.3, Spring Web, Spring Data MongoDB, Jakarta Validation, Maven |
| **Database** | MongoDB 6.0 |
| **Containerization**| Docker, Docker Compose, Docker Volumes, Multi-stage Dockerfiles |
| **CI/CD** | GitHub Actions Pipeline (`backend-build`, `frontend-build`, `docker-lint`) |

---

## 📂 Project Directory Structure

```
RoboVault/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions Automated CI/CD
├── .gitignore                   # Multi-stack gitignore
├── .env                         # Runtime environment settings
├── .env.example                 # Environment template
├── docker-compose.yml           # Multi-container orchestration
├── README.md                    # Project documentation
│
├── backend/
│   ├── Dockerfile               # Multi-stage Maven + Eclipse Temurin 17 JRE
│   ├── pom.xml                  # Maven Project Object Model
│   └── src/
│       ├── main/
│       │   ├── java/com/robovault/
│       │   │   ├── RoboVaultApplication.java
│       │   │   ├── config/       # CORS & Mongo configuration
│       │   │   ├── controller/   # REST API Controllers
│       │   │   ├── dto/          # Data Transfer Objects
│       │   │   ├── exception/    # Custom Exceptions & Global Handler
│       │   │   ├── model/        # Mongo Document Entities & Enums
│       │   │   ├── repository/   # Spring Data Repositories
│       │   │   ├── service/      # Business logic services
│       │   │   └── util/         # Sample data seeding
│       │   └── resources/
│       │       └── application.properties
│       └── test/
│           └── java/com/robovault/RoboVaultApplicationTests.java
│
└── frontend/
    ├── Dockerfile               # Multi-stage Node.js build + Nginx production
    ├── nginx.conf               # Nginx reverse proxy routing
    ├── package.json             # NPM dependencies & scripts
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js               # Main Shell & Tab Router
        ├── App.css              # Robotics theme styling
        ├── index.js
        ├── index.css
        ├── components/          # Navbar, Sidebar, Badges, StatCards
        ├── pages/               # Dashboard, Assets, Checkouts, Maintenance, Projects, Faults
        └── services/            # Axios API client with fallback data
```

---

## ⚡ Quick Start with Docker Compose

Running the entire full-stack application requires just one command:

```bash
# Clone the repository
git clone https://github.com/your-username/RoboVault.git
cd RoboVault

# Build and start all 3 containers (MongoDB, Spring Boot Backend, React Frontend)
docker compose up -d --build
```

### Accessing the Applications:
- **Frontend Web UI**: [http://localhost:3000](http://localhost:3000)
- **Spring Boot REST API**: [http://localhost:8080/api/dashboard/summary](http://localhost:8080/api/dashboard/summary)
- **MongoDB Connection**: `mongodb://localhost:27017/robovault`

### Verify Containers:
```bash
docker ps
```

### Stop Services:
```bash
docker compose down
```

---

## 💻 Local Development Setup (Without Docker)

### Prerequisites:
- **Java JDK 17+**
- **Apache Maven 3.8+**
- **Node.js 18+ & NPM**
- **Local MongoDB instance running on port 27017**

### 1. Start MongoDB
Ensure MongoDB is running locally:
```bash
mongod --dbpath <path_to_data>
```

### 2. Start Backend (Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```
The backend initializes on port `8080` and auto-seeds initial lab equipment (STM32, ESP32, LIDAR, Oscilloscopes, etc.).

### 3. Start Frontend (React)
```bash
cd frontend
npm install
npm start
```
The React development server opens automatically at [http://localhost:3000](http://localhost:3000).

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Aggregate metrics, asset distributions, recent activity |
| `GET` | `/api/assets` | Retrieve all laboratory assets |
| `GET` | `/api/assets/search?query=ESP32` | Filter assets by name, model, serial, or category |
| `POST` | `/api/assets` | Register new equipment |
| `PUT` | `/api/assets/{id}` | Update asset specifications & location |
| `DELETE`| `/api/assets/{id}` | Remove asset record |
| `GET` | `/api/checkouts` | Retrieve all checkout requests & custody logs |
| `POST` | `/api/checkouts` | Request asset borrowing |
| `PUT` | `/api/checkouts/{id}/approve` | Approve checkout request |
| `PUT` | `/api/checkouts/{id}/issue` | Hand over physical hardware to student |
| `PUT` | `/api/checkouts/{id}/return` | Return equipment & log condition check |
| `GET` | `/api/maintenance` | Retrieve all maintenance tickets |
| `POST` | `/api/maintenance` | Log new maintenance issue |
| `PUT` | `/api/maintenance/{id}` | Update diagnosis, parts replaced, and costs |
| `GET` | `/api/projects` | List research & capstone projects |
| `POST` | `/api/projects/{id}/allocate/{assetId}` | Allocate asset to a project |
| `DELETE`| `/api/projects/{id}/allocate/{assetId}` | Deallocate asset from a project |
| `GET` | `/api/faults` | View all submitted hardware defects |
| `POST` | `/api/faults/{id}/send-to-maintenance` | Convert fault report into active maintenance case |

---

## 🧪 Acceptance & Persistence Testing

### 1. Database Persistence Verification Test
```bash
# 1. Start the stack
docker compose up -d

# 2. Add an asset via UI or REST API
curl -X POST http://localhost:8080/api/assets \
  -H "Content-Type: application/json" \
  -d '{"assetId":"RB-TEST-001","name":"Test Sensor","category":"SENSORS","quantity":1,"location":"Rack 1"}'

# 3. Stop and delete the MongoDB container (simulating failure)
docker compose stop mongodb
docker compose rm -f mongodb

# 4. Recreate and start MongoDB
docker compose up -d mongodb

# 5. Query the asset
curl http://localhost:8080/api/assets
# Result: RB-TEST-001 persists safely via the Docker Volume!
```

---

## 🐙 Step-by-Step GitHub Push Guide

To push this repository to GitHub:

### Step 1: Open Terminal in the Project Root
```bash
cd "C:\Users\sabarivasan\.gemini\antigravity\scratch\RoboVault"
```

### Step 2: Initialize Git & Stage Files
```bash
# Initialize git repository
git init -b main

# Check staged status
git status

# Stage all files
git add .

# Create initial commit
git commit -m "feat: initial commit of RoboVault full-stack platform"
```

### Step 3: Create a New GitHub Repository
1. Go to [https://github.com/new](https://github.com/new).
2. Enter Repository name: `RoboVault` (or `robovault-platform`).
3. Set visibility to **Public** or **Private**.
4. **Do NOT** initialize with README, .gitignore, or license (we already created them!).
5. Click **Create repository**.

### Step 4: Link Remote & Push
```bash
# Add your GitHub repository as remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/RoboVault.git

# Push code to main branch
git push -u origin main
```

*(If using SSH):*
```bash
git remote add origin git@github.com:YOUR_USERNAME/RoboVault.git
git push -u origin main
```

---

## 📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

