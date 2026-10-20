# ⚡ ROBO VAULT — Robotics Lab Asset & Maintenance Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**RoboVault** is an institutional-grade, full-stack management platform engineered for university robotics laboratories, mechatronics workshops, and autonomous systems research groups. It eliminates chaotic spreadsheets and manual register clipboards by digitizing hardware custody, return inspections, project allocations, and preventive/corrective maintenance workflows.

---

## 📌 Architecture & Tech Stack

```text
  React 18 SPA (Vite + Recharts)
              │
              ▼  (HTTP / JWT Bearer)
   Nginx Reverse Proxy (:80 / :3000)
              │
              ▼
  Spring Boot 3.2.3 REST API (:8080)
   - Spring Security + JJWT 0.12.5
   - Spring Data MongoDB
   - Spring Boot Actuator
              │
              ▼
  MongoDB 6.0 Database (:27017)
              │
              ▼
  Docker Volume (`mongo_data:/data/db`) ➔ Persistent Storage
```

### Detailed Documentation
- [System Architecture & Data Flows](docs/architecture.md)
- [Database Schema & Concurrency Strategy](docs/database-schema.md)
- [REST API Integration Guide & Curl Examples](docs/api-guide.md)
- [Testing & Quality Assurance Guide](docs/testing-guide.md)
- [Production Deployment Guide (Ubuntu / AWS EC2)](docs/deployment-guide.md)

---

## 👥 Built-in Personas & Test Credentials

The backend auto-seeds four test user accounts with pre-hashed BCrypt passwords:

| Role | Username | Email | Password | Primary Capabilities |
|---|---|---|---|---|
| **ADMIN** | `admin` | `admin@robovault.io` | `Admin123!` | Complete inventory oversight, user management, approval authority, audit trail |
| **LAB_ASSISTANT** | `assistant` | `assistant@robovault.io` | `Assistant123!` | Checkouts fulfillment, physical returns inspection, diagnostic repairs |
| **FACULTY** | `faculty` | `faculty@robovault.io` | `Faculty123!` | Research project management, equipment pooling, defect reporting |
| **STUDENT** | `student` | `student@robovault.io` | `Student123!` | Catalog browsing, borrow requests, status tracking, defect logs |

*Tip: The web login screen includes one-click persona quick-fill buttons for instant evaluation.*

---

## 🚀 Key Modules & Capabilities

1. **Mission Control Dashboard**: Live Recharts visualizations calculating real-time inventory utilization, status breakdown, category distribution, and overdue checkouts directly from MongoDB aggregates.
2. **12 Asset Categories**: Robots, Microcontrollers, Development Boards, Sensors, Motors, Motor Drivers, Communication Modules, Power Supplies, Electronic Components, Tools, Test Equipment, and 3D Printers.
3. **Custody State Machine**:
   $$\text{Submit Request} \longrightarrow \text{Approve/Reject} \longrightarrow \text{Issue} \ (\text{IN\_USE}) \longrightarrow \text{Return} \longrightarrow \text{Inspection} \longrightarrow \text{AVAILABLE / MAINTENANCE}$$
4. **Maintenance & Repairs**: Corrective/preventative work orders tracking technician assignment, diagnosis findings, replaced parts, repair expenses, and operational restoration.
5. **Project Hardware Allocation**: Dedicate pools of microcontrollers and sensors to specific research projects without double-allocating inventory.
6. **Fault Reporting**: Field defect submissions with severity rating (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and one-click escalation to the maintenance pipeline.
7. **Security & Auditing**: Stateless HMAC-SHA256 JWT authentication, backend `@PreAuthorize` role evaluation, and an immutable system activity log.

---

## ⚡ Quick Start with Docker Compose

To launch all three tiers (MongoDB, Spring Boot, React) simultaneously:

```bash
# Clone the repository
git clone https://github.com/sabarivasan2308/RoboVault.git
cd RoboVault

# Build and start all services in detached mode
docker compose up -d --build
```

### Endpoints:
- **Frontend Web UI**: [http://localhost:3000](http://localhost:3000)
- **Spring Boot REST API**: [http://localhost:8080/api/dashboard/summary](http://localhost:8080/api/dashboard/summary)
- **Swagger / OpenAPI 3**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Spring Boot Actuator Health**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- **MongoDB Connection**: `mongodb://localhost:27017/robovault`

---

## 💻 Local Development Setup (Without Docker)

### Prerequisites:
- Java JDK 17 or 21
- Apache Maven 3.8+
- Node.js 18+ & NPM
- MongoDB 6.0 running locally on port `27017`

### 1. Start MongoDB
Ensure MongoDB is running locally on `localhost:27017`:
```bash
mongod --dbpath /data/db
```

### 2. Start Backend (Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```
*The backend seeds default users, assets, checkouts, and maintenance records on first boot.*

### 3. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Directory Structure

```
RoboVault/
├── .env.example                 # Environment configuration template
├── docker-compose.yml           # Multi-container orchestration (App + DB + UI)
├── robovault-api-collection.json# Postman / Insomnia API collection
├── ci/
│   └── ci.yml                   # CI test and packaging workflow
├── docs/
│   ├── architecture.md          # System design & Mermaid diagrams
│   ├── database-schema.md       # Collections, indexes, concurrency
│   ├── api-guide.md             # REST endpoints & curl examples
│   ├── testing-guide.md         # Unit testing & persistence verification
│   └── deployment-guide.md      # AWS EC2 / Ubuntu deployment guide
├── backend/
│   ├── Dockerfile               # Multi-stage Maven build + Eclipse Temurin 21 JRE
│   ├── pom.xml                  # Spring Boot 3.2.3 dependencies
│   └── src/
│       ├── main/java/com/robovault/
│       │   ├── RoboVaultApplication.java
│       │   ├── activity/        # Audit event logs
│       │   ├── assets/          # 12 hardware categories, stock management
│       │   ├── auth/            # Login, Me, Logout endpoints
│       │   ├── checkouts/       # Custody lifecycle state machine
│       │   ├── common/          # Global exception handler & ApiResponse
│       │   ├── config/          # Mongo, OpenAPI & DataInitializer seed
│       │   ├── dashboard/       # Aggregated KPIs & Recharts metrics
│       │   ├── faults/          # Defect reports & escalation
│       │   ├── maintenance/     # Diagnostics, parts, repair cost tracking
│       │   ├── projects/        # Research team hardware pools
│       │   ├── security/        # JWT filter, UserPrincipal, SecurityConfig
│       │   └── users/           # User administration & role management
│       └── test/java/com/robovault/
│           ├── assets/AssetServiceTest.java
│           └── checkouts/CheckoutServiceTest.java
└── frontend/
    ├── Dockerfile               # Vite build + Nginx reverse proxy
    ├── nginx.conf               # Web server & /api proxy configuration
    ├── package.json             # React 18, Vite, Lucide, Recharts
    ├── vite.config.js           # Vite dev proxy configuration
    └── src/
        ├── api/                 # Axios clients for all backend modules
        ├── auth/                # AuthContext, ProtectedRoute, RoleGuard
        ├── components/          # StatCards, StatusBadges, Pagination
        ├── layouts/             # Responsive Sidebar, Topbar, AppLayout
        ├── pages/               # Dashboard, Assets, Checkouts, Maintenance,
        │                        # Projects, Faults, Users, Audit, Profile
        ├── routes/              # Declarative AppRoutes
        └── styles/main.css      # Robotics dark theme design system
```

---

## 🧪 Automated Testing

Run the backend unit test suite:
```bash
cd backend
mvn test
```

Build the frontend production package:
```bash
cd frontend
npm run build
```

---

## 📄 License
This project is licensed under the MIT License.
