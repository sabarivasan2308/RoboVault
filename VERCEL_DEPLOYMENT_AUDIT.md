# RoboVault NEXUS — Vercel Deployment Audit

**Audit Date:** 2026-11-06  
**Auditor:** Senior DevOps & Vercel Deployment Specialist  
**Project Path:** `C:\Users\sabarivasan\.gemini\antigravity\scratch\RoboVault`  
**GitHub Repository:** `https://github.com/sabarivasan2308/RoboVault.git`  
**Target Environment:** Vercel (Edge Network / Frontend Static Hosting)

---

## 1. Executive Summary

This comprehensive audit evaluates the readiness of **ROBO VAULT NEXUS** for deployment to Vercel. 

### Key Findings:
1. **Frontend Build Health:** The React + Vite frontend builds cleanly (`dist/` created in 3.34s) with zero compiler or syntax errors. `npm ci` is supported and executes cleanly against `package-lock.json`.
2. **Architecture Decoupling:** Vercel will host the React single-page application (SPA). Vercel does not host the Docker Compose stack (Spring Boot JVM + MongoDB + Node.js telemetry engine).
3. **Critical GitHub Drift Risk:** The remote GitHub repository (`origin/main`) currently **lacks 7 restored pages** (`FleetTrackerPage.jsx`, `FleetTelemetryPage.jsx`, `DigitalTwinPage.jsx`, `PredictiveHealthPage.jsx`, `SchedulingPage.jsx`, `ResearchPage.jsx`, `ReportsPage.jsx`) and 2 API modules (`missionApi.js`, `reservationApi.js`). If Vercel builds from GitHub without pushing these local files, the deployment will either fail or deploy without these modules.
4. **SPA Routing Requirement:** Vite SPAs on Vercel require a `vercel.json` rewrite configuration (`"source": "/(.*)", "destination": "/index.html"`) to prevent HTTP 404s when users refresh deep links like `/fleet-tracker` or `/digital-twin`.
5. **Configurable API Endpoint:** `frontend/src/api/client.js` is already architected to consume `import.meta.env.VITE_API_BASE_URL || '/api'`. No hardcoded localhost API endpoints exist in frontend code.

---

## 2. Frontend Configuration Inspection

### 2.1 `package.json` & Dependencies
- **Project Name:** `robovault-frontend` (v1.0.0, `"type": "module"`)
- **Core Dependencies:**
  - `react`: `^18.2.0`
  - `react-dom`: `^18.2.0`
  - `react-router-dom`: `^6.22.3`
  - `axios`: `^1.6.8`
  - `lucide-react`: `^0.359.0`
  - `recharts`: `^2.12.3`
- **Build Tooling:**
  - `vite`: `^5.1.6`
  - `@vitejs/plugin-react`: `^4.2.1`
  - `overrides`: `"esbuild": "^0.25.0"` (security vulnerability mitigation)
- **Scripts:**
  - `"build": "vite build"` (produces `dist/`)
  - `"dev": "vite"`
  - `"preview": "vite preview"`
- **Assessment:** Clean, standard Vite setup. All production dependencies are pinned and compatible.

### 2.2 Lockfile & Installation Command
- `frontend/package-lock.json` is present and synchronized with `package.json`.
- Tested `npm ci --dry-run`: Completed in 535ms with zero dependency tree conflicts.
- **Recommended Vercel Install Command:** `npm ci`

### 2.3 Vite Configuration (`frontend/vite.config.js`)
- Root: `frontend/`
- Output directory: `dist/`
- Plugins: `@vitejs/plugin-react`
- Manual Chunks:
  - `vendor`: `['react', 'react-dom', 'react-router-dom']`
  - `charts`: `['recharts', 'lucide-react']`
- Local dev proxy configured: `'/api' -> 'http://localhost:8080'` (applies only during local `vite dev`, not in production bundle).
- **Assessment:** Production bundle creates optimized code-split chunks.

### 2.4 Entry Point & HTML Template
- `frontend/index.html`: Contains `<div id="root"></div>` and `<script type="module" src="/src/main.jsx"></script>`.
- Fonts: Preconnected to Google Fonts (`JetBrains Mono`, `Plus Jakarta Sans`).
- `frontend/src/main.jsx`: Mounts `<App />` into `document.getElementById('root')` with `<React.StrictMode>`.

### 2.5 Routing Architecture (`frontend/src/routes/AppRoutes.jsx`)
The application uses HTML5 History API via `react-router-dom` with 21 mapped routes:
- `/login`
- `/dashboard`
- `/fleet-tracker` (alias: `/missions`)
- `/digital-twin`
- `/fleet-telemetry` (alias: `/telemetry`)
- `/predictive-health` (alias: `/predictive`)
- `/scheduling`
- `/research-intelligence` (alias: `/research`)
- `/reports`
- `/assets`
- `/checkouts`
- `/maintenance`
- `/projects`
- `/faults`
- `/users`
- `/activity-logs`
- `/profile`
- `*` (Catch-all: `NotFoundPage`)

> [!IMPORTANT]
> **Vercel Routing Rewrite Required:**
> Because Vite generates a Single-Page Application (SPA) where routing is client-side, any direct URL request or browser refresh on a sub-path (e.g., `https://<vercel-domain>/fleet-tracker`) will result in an HTTP 404 from Vercel's edge CDN unless a rewrite rule routes all requests to `/index.html`.

---

## 3. Backend & API Communication Audit

### 3.1 API Client Configuration (`frontend/src/api/client.js`)
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});
```
- Request interceptor attaches Bearer JWT token from `localStorage.getItem('token')`.
- Response interceptor handles 401 Unauthorized by clearing session and redirecting to `/login`.
- **Zero hardcoded localhost URLs:** Comprehensive regex search verified that all API requests use `apiClient` with relative paths (`/assets`, `/missions`, `/reservations`, etc.).

### 3.2 Dual-Tier Backend Architecture
RoboVault contains two distinct backend implementations:
1. **Tier A (Node.js Engine — `local-server.js`):**
   - Implements autonomous mission simulation, A* pathfinding, dynamic obstacle avoidance, robot fleet telematics, 2D digital twin layout, explainable predictive maintenance risk engine, and JSON database persistence (`robovault-local-db.json`).
2. **Tier B (Spring Boot Java 17 + MongoDB — `backend/`):**
   - Implements enterprise RBAC auth, MongoDB repository persistence, QR code asset tracking, custody checkouts, work orders, faults, projects, and users.
3. **Containerized Stack (`docker-compose.yml`):**
   - Runs `mongodb:6.0`, `robovault-backend` (Spring Boot), and `robovault-frontend` (Nginx reverse proxy).

### 3.3 Production Hosting Requirements for Backend & Database
Vercel is a serverless frontend hosting platform. It will not run the long-running Spring Boot JVM process or the persistent MongoDB daemon.
To enable complete end-to-end functionality online:
- **Spring Boot API:** Requires deployment to a container/JVM host (e.g., Railway, Render, Fly.io, AWS ECS, or DigitalOcean App Platform).
- **MongoDB:** Requires a cloud-hosted MongoDB cluster (e.g., MongoDB Atlas).
- **Environment Variable Linkage:** Once hosted, set `VITE_API_BASE_URL=https://api.yourdomain.com/api` in Vercel Project Settings.

### 3.4 Behavior if Backend is Not Yet Publicly Hosted
If Vercel is deployed before the backend is hosted:
- The website UI, typography, layouts, charts, navigation, and client-side simulations will render with high visual fidelity.
- Login and backend-dependent data calls (`/api/assets`, `/api/checkouts`, etc.) will return HTTP 404/network errors.
- As required by project rules: No fake API responses will be injected, no silent redirects to localhost will occur, and backend-dependent limitations are clearly documented.

---

## 4. Git Repository & Remote Drift Audit

### 4.1 Local vs Remote Branch Status
- Current branch: `main`
- Ahead of `origin/main` by 2 commits (`fcc4bd9` and `6507899`).
- Remote: `https://github.com/sabarivasan2308/RoboVault.git`

### 4.2 Untracked & Modified Files in Local Workspace
```
Modified:
  frontend/.dockerignore
  frontend/src/layouts/Sidebar.jsx
  frontend/src/routes/AppRoutes.jsx

Untracked Frontend Code Required for NEXUS:
  frontend/src/api/missionApi.js
  frontend/src/api/reservationApi.js
  frontend/src/pages/DigitalTwinPage.jsx
  frontend/src/pages/FleetTelemetryPage.jsx
  frontend/src/pages/FleetTrackerPage.jsx
  frontend/src/pages/PredictiveHealthPage.jsx
  frontend/src/pages/ReportsPage.jsx
  frontend/src/pages/ResearchPage.jsx
  frontend/src/pages/SchedulingPage.jsx

Untracked Local Backup / Private Data (MUST NEVER BE COMMITTED):
  .env
  backup-persistence-20261105-044359/
  backend-fix-backup-20261021-103302/
  robovault-local-db.json
  ROBO_VAULT_FINAL_AUDIT_20261021-104229.txt
```

### 4.3 Deployment Impact
If Vercel links to `sabarivasan2308/RoboVault` on GitHub:
- The 7 untracked pages and 2 API files currently do not exist on GitHub.
- Pushing the local frontend files to GitHub is **essential** so Vercel can build the full RoboVault NEXUS application.
- Prior to pushing, the exact file list must be approved by the user, and all backups, `.env` files, and database files must remain excluded.

---

## 5. Vercel Configuration Specifications

To deploy the frontend to Vercel cleanly, the following configuration is specified:

| Setting | Value | Rationale |
| :--- | :--- | :--- |
| **Project Name** | `robovault-nexus` | Clean URL identifier |
| **Framework Preset** | `Vite` | Auto-detects Vite build output |
| **Root Directory** | `frontend` | Monorepo isolation; builds React app |
| **Build Command** | `npm run build` | Runs `vite build` to output `dist` |
| **Output Directory** | `dist` | Standard Vite output |
| **Install Command** | `npm ci` | Strict lockfile installation |
| **Node.js Version** | `18.x` or `20.x` | Modern LTS support |
| **Routing Config** | `frontend/vercel.json` | SPA rewrites to `/index.html` |

---

## 6. Action Plan & Phased Roadmap

1. **Phase 2 (Preparation):**
   - Create a pre-modification backup of the frontend configuration.
   - Create `frontend/vercel.json` with SPA routing rewrites.
   - Create `frontend/.env.production.example` documenting `VITE_API_BASE_URL`.
2. **Phase 4 (Local Verification):**
   - Run `npm run build` in `frontend/` to confirm that the bundle compiles with the new Vercel configuration.
3. **Phase 5 (GitHub Preparation):**
   - Stage **only** the frontend application files (`Sidebar.jsx`, `AppRoutes.jsx`, the 7 pages, 2 API helpers, and `vercel.json`).
   - Present the exact staging manifest to the user for explicit approval.
   - Commit and push to `origin/main`.
4. **Phase 6 & 7 (Deployment & Live Verification):**
   - Trigger/execute Vercel deployment.
   - Verify live URL, SSL certificate, homepage load, asset loading, and nested route refreshes.
   - Compile final `VERCEL_DEPLOYMENT_REPORT.md`.

