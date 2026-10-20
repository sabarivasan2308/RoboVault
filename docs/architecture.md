# RoboVault Architecture & System Design Documentation

## 1. System Overview

**RoboVault** is an enterprise-grade robotics laboratory asset, custody, and maintenance management platform. It streamlines equipment checkouts, return inspections, project allocations, and preventive/corrective maintenance workflows for academic and industrial research labs.

```mermaid
flowchart TD
    subgraph Client["Client Browser (React 18 SPA)"]
        UI["Tailored Dark UI / Recharts"]
        AuthContext["Auth Context & Token Interceptors"]
        Router["React Router v6 & Role Guards"]
    end

    subgraph Gateway["Reverse Proxy / Web Server"]
        Nginx["Nginx Container (Port 80)"]
    end

    subgraph Backend["Spring Boot 3.2 Application (Java 21)"]
        SecurityFilter["JWT Authentication Filter"]
        Controllers["REST Controllers (/api/*)"]
        Services["Business Services & Concurrency Guards"]
        Auditing["Audit & Activity Event Dispatcher"]
        Actuator["Actuator Health & Metrics (/actuator)"]
    end

    subgraph Persistence["Database Cluster"]
        Mongo["MongoDB 6.0 Database Engine"]
        Volume[("Persistent Docker Volume (mongo_data)")]
    end

    Client -- HTTP / HTTPS --> Nginx
    Nginx -- "/api/*" --> Controllers
    Nginx -- "Static Assets" --> UI
    SecurityFilter --> Controllers
    Controllers --> Services
    Services --> Auditing
    Services --> Mongo
    Mongo --> Volume
    Actuator --> Nginx
```

---

## 2. Authentication & Authorization Flow

RoboVault utilizes stateless HMAC-SHA256 JSON Web Tokens (JWT). All protected API operations evaluate user identity and assigned security roles (`ADMIN`, `LAB_ASSISTANT`, `FACULTY`, `STUDENT`).

```mermaid
sequenceDiagram
    autonumber
    actor User as Operator / Student
    participant Frontend as React SPA (Vite)
    participant AuthCtrl as AuthController
    participant SpringSec as Spring Security & Filter
    participant Mongo as MongoDB Engine

    User->>Frontend: Enter credentials (email + password)
    Frontend->>AuthCtrl: POST /api/auth/login
    AuthCtrl->>Mongo: Query user by email
    Mongo-->>AuthCtrl: User entity with BCrypt hash
    AuthCtrl->>AuthCtrl: Verify BCrypt password match
    AuthCtrl->>AuthCtrl: Generate HMAC-SHA256 JWT Token
    AuthCtrl-->>Frontend: 200 OK + JWT Token + User Profile
    Frontend->>Frontend: Store token in secure memory/session

    Note over Frontend,SpringSec: Subsequent Protected API Requests
    Frontend->>SpringSec: GET /api/assets (Bearer <JWT>)
    SpringSec->>SpringSec: Validate signature, expiration & claims
    SpringSec->>SpringSec: Build SecurityContext (UserPrincipal & Roles)
    SpringSec->>Mongo: Fetch data matching permissions
    Mongo-->>SpringSec: Query results
    SpringSec-->>Frontend: 200 OK (ApiResponse payload)
```

---

## 3. Checkout, Issue & Inspection State Machine

Equipment custody follows a strict state transition model preventing double issuance, stock negative drift, and unaccounted equipment condition loss.

```mermaid
stateDiagram-v2
    [*] --> PENDING: Student submits request (stock reserved)
    PENDING --> REJECTED: Admin / Assistant rejects with reason
    PENDING --> CANCELLED: Student cancels before approval
    PENDING --> APPROVED: Staff approves request

    APPROVED --> ISSUED: Staff issues physical asset (condition logged)
    ISSUED --> OVERDUE: Return due-date exceeded without return
    OVERDUE --> RETURNED: Equipment returned and inspected
    ISSUED --> RETURNED: Returned on time & condition inspected

    state RETURNED {
        direction LR
        GOOD --> AvailableStock: Condition Good / Fair
        DAMAGED --> MaintenanceQueue: Condition Poor / Damaged
    }

    REJECTED --> [*]
    CANCELLED --> [*]
    MaintenanceQueue --> [*]
    AvailableStock --> [*]
```

---

## 4. Multi-Container Docker Network Architecture

RoboVault isolates application tiers inside a dedicated Docker bridge network (`robovault-net`), shielding MongoDB from public exposure while exposing only standard web ports.

```mermaid
flowchart LR
    subgraph Host["Host Machine / Cloud VM (Ubuntu / EC2)"]
        subgraph Ports["Exposed Ports"]
            P80["Port 80 (HTTP)"]
            P3000["Port 3000 (Dev UI)"]
            P8080["Port 8080 (Dev API)"]
        end

        subgraph DockerNet["Docker Network: robovault-net"]
            subgraph FrontendContainer["Frontend Container (Nginx)"]
                NginxSrv["Nginx Web Server"]
                DistFiles["Compiled Vite Static Files"]
            end

            subgraph BackendContainer["Backend Container (Spring Boot)"]
                App["RoboVaultApplication.jar"]
                JVM["Eclipse Temurin JRE 21"]
            end

            subgraph DBContainer["Database Container (MongoDB 6.0)"]
                MongoDaemon["mongod"]
                DataStore[("/data/db")]
            end
        end

        subgraph HostStorage["Persistent Host Storage"]
            NamedVol["Docker Named Volume: mongo_data"]
        end
    end

    P80 --> NginxSrv
    NginxSrv -- "/api/*" --> App
    App -- "mongodb://mongodb:27017/robovault" --> MongoDaemon
    DataStore --> NamedVol
```

---

## 5. Security & Concurrency Design

1. **Atomic Concurrency Control**:
   - Equipment allocations and returns execute atomic increment/decrement operators (`$inc`) or synchronized transactional routines in MongoDB to eliminate race conditions under concurrent checkouts.
2. **Defensive Deletion Safeguards**:
   - Assets tied to active checkouts, uncompleted repairs, or dedicated project pools cannot be deleted; the system raises a `400 Bad Request` with actionable diagnostics.
3. **Role-Enforced Endpoint Boundaries**:
   - `@PreAuthorize("hasRole('ADMIN')")` secures sensitive administrative actions (user role alterations, account toggling).
   - `@PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")` permits inventory auditing and repair lifecycle operations.
4. **Immutable Audit Trails**:
   - Every mutation produces an asynchronous or transactional `ActivityLog` entry recording operator identity, target entity ID, action token, and payload metadata.
