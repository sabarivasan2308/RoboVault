# RoboVault Database Schema & Persistence Specification

## 1. Overview & Technology

RoboVault utilizes **MongoDB 6.0+** paired with **Spring Data MongoDB**. Data persistence is isolated on a persistent Docker volume (`mongo_data:/data/db`) to guarantee durability across container restarts, migrations, and deployments.

---

## 2. Collections & Document Models

### 2.1. `users` Collection
Stores registered laboratory personnel and their authorization level.

```json
{
  "_id": "660c1f5e2a9b4c001f3e1a01",
  "username": "admin",
  "email": "admin@robovault.io",
  "password": "$2a$10$e8wF2e... (BCrypt hash)",
  "fullName": "System Administrator",
  "role": "ADMIN",
  "department": "Robotics & Automation",
  "phoneNumber": "+1-555-0100",
  "active": true,
  "createdAt": "2026-10-20T08:00:00Z",
  "updatedAt": "2026-10-20T08:00:00Z"
}
```

**Indexes:**
- `username`: Unique Index (`{ username: 1 }, { unique: true }`)
- `email`: Unique Index (`{ email: 1 }, { unique: true }`)
- `role`: Standard Index (`{ role: 1 }`)

---

### 2.2. `assets` Collection
Core laboratory hardware catalog encompassing robots, sensors, controllers, and tools.

```json
{
  "_id": "660c1f5e2a9b4c001f3e1a02",
  "assetId": "RB-STM32-001",
  "name": "STM32F4 Discovery Kit",
  "category": "MICROCONTROLLER",
  "brand": "STMicroelectronics",
  "model": "STM32F407G-DISC1",
  "serialNumber": "STM-2024-8841",
  "quantity": 10,
  "availableQuantity": 8,
  "location": "Robotics Lab - Rack A1",
  "status": "AVAILABLE",
  "condition": "GOOD",
  "purchaseDate": "2024-01-15",
  "description": "ARM Cortex-M4 high-performance discovery board with embedded ST-LINK debugger.",
  "createdAt": "2026-10-20T08:00:00Z",
  "updatedAt": "2026-10-20T08:00:00Z",
  "createdBy": "admin",
  "updatedBy": "admin"
}
```

**Indexes:**
- `assetId`: Unique Index (`{ assetId: 1 }, { unique: true }`)
- `category`: Standard Index (`{ category: 1 }`)
- `status`: Standard Index (`{ status: 1 }`)
- `location`: Standard Index (`{ location: 1 }`)
- Text Index: Full text search across `{ name: "text", brand: "text", model: "text", description: "text" }`

---

### 2.3. `checkout_records` Collection
Tracks custody lifecycle, borrower commitments, due-dates, and condition audits.

```json
{
  "_id": "660c1f5e2a9b4c001f3e1a03",
  "requestId": "REQ-20261020-001",
  "requesterUsername": "student1",
  "requesterFullName": "Jane Doe",
  "assetId": "RB-STM32-001",
  "assetName": "STM32F4 Discovery Kit",
  "quantity": 1,
  "projectId": "PRJ-AUTONOMOUS-ROVER",
  "projectName": "Mars Rover Prototype",
  "requestDate": "2026-10-20T08:30:00Z",
  "dueDate": "2026-10-27T17:00:00Z",
  "status": "ISSUED",
  "approverUsername": "admin",
  "approvedAt": "2026-10-20T08:45:00Z",
  "issuedAt": "2026-10-20T09:00:00Z",
  "returnedAt": null,
  "issueCondition": "GOOD",
  "returnCondition": null,
  "notes": "Required for embedded RTOS telemetry benchmarks.",
  "rejectionReason": null
}
```

**Indexes:**
- `requestId`: Unique Index (`{ requestId: 1 }, { unique: true }`)
- `requesterUsername`: Standard Index (`{ requesterUsername: 1 }`)
- `assetId`: Standard Index (`{ assetId: 1 }`)
- `status`: Standard Index (`{ status: 1 }`)
- `dueDate`: Standard Index (`{ dueDate: 1 }`)

---

### 2.4. `maintenance_records` Collection
Work-orders for preventative maintenance, sensor recalibration, and hardware repair.

```json
{
  "_id": "660c1f5e2a9b4c001f3e1a04",
  "assetId": "RB-ROBOT-001",
  "assetName": "TurtleBot 4 Mobile Base",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "assignedTechnician": "Alex Rivera",
  "issueDescription": "Right wheel encoder intermittently fails under 15% duty cycle.",
  "diagnosisFindings": "Encoder disc optical sensor had accumulated carbon particulates.",
  "actionsTaken": "Cleaned optical sensor lens and resoldered connector J3.",
  "partsReplaced": ["Optical encoder flex ribbon"],
  "cost": 34.50,
  "startDate": "2026-10-20T09:15:00Z",
  "completionDate": null,
  "openedBy": "labtech",
  "resolvedBy": null,
  "createdAt": "2026-10-20T09:15:00Z",
  "updatedAt": "2026-10-20T10:00:00Z"
}
```

**Indexes:**
- `assetId`: Standard Index (`{ assetId: 1 }`)
- `status`: Standard Index (`{ status: 1 }`)
- `priority`: Standard Index (`{ priority: 1 }`)

---

### 2.5. `projects` Collection
Supervised student/faculty robotics projects and their dedicated equipment allocations.

```json
{
  "_id": "660c1f5e2a9b4c001f3e1a05",
  "code": "PRJ-SWARM-2026",
  "name": "Collaborative Swarm Drones",
  "description": "Multi-agent decentralized navigation and obstacle avoidance.",
  "leadFaculty": "Dr. Sarah Chen",
  "leadStudent": "Jane Doe",
  "department": "Robotics Engineering",
  "status": "ACTIVE",
  "startDate": "2026-09-01",
  "targetCompletionDate": "2027-05-30",
  "allocations": [
    {
      "id": "alloc-9812",
      "assetId": "RB-ESP32-014",
      "assetName": "ESP32 NodeMCU Module",
      "quantity": 4,
      "allocatedAt": "2026-09-10T11:00:00Z",
      "allocatedBy": "admin"
    }
  ]
}
```

**Indexes:**
- `code`: Unique Index (`{ code: 1 }, { unique: true }`)
- `status`: Standard Index (`{ status: 1 }`)

---

### 2.6. `fault_reports` Collection
Defect tickets reported by lab users before escalation to formal maintenance.

```json
{
  "_id": "660c1f5e2a9b4c001f3e1a06",
  "assetId": "RB-SENSOR-042",
  "assetName": "RPLIDAR A1 360 Laser Scanner",
  "title": "Motor rpm drop & scan data timeout",
  "description": "PWM controller does not spin LiDAR mirror past 400rpm.",
  "symptoms": "High pitched whine and USB UART packet drop",
  "severity": "HIGH",
  "status": "INVESTIGATING",
  "reportedBy": "student1",
  "reportedAt": "2026-10-20T07:45:00Z",
  "assignedTechnician": "Alex Rivera",
  "resolution": null
}
```

**Indexes:**
- `assetId`: Standard Index (`{ assetId: 1 }`)
- `severity`: Standard Index (`{ severity: 1 }`)
- `status`: Standard Index (`{ status: 1 }`)

---

### 2.7. `activity_logs` Collection
Immutable audit log recording every system mutation.

```json
{
  "_id": "660c1f5e2a9b4c001f3e1a07",
  "action": "CHECKOUT_ISSUED",
  "entityType": "CHECKOUT",
  "entityId": "REQ-20261020-001",
  "performedBy": "admin",
  "details": "Asset RB-STM32-001 (Qty: 1) handed over in GOOD condition to student1.",
  "timestamp": "2026-10-20T09:00:00Z",
  "metadata": {
    "issueCondition": "GOOD",
    "dueDate": "2026-10-27T17:00:00Z"
  }
}
```

**Indexes:**
- `timestamp`: Descending Index (`{ timestamp: -1 }`)
- `entityType`: Standard Index (`{ entityType: 1 }`)
- `performedBy`: Standard Index (`{ performedBy: 1 }`)

---

## 3. Concurrency & Atomicity Strategy

To prevent race conditions during concurrent checkouts or allocations:
1. **Quantity Invariant**: The system guarantees `0 <= availableQuantity <= quantity` at all times.
2. **Atomic Inventory Checks**:
   - When a request is approved, the available stock is checked and decremented atomically:
     `db.assets.updateOne({ _id: id, availableQuantity: { $gte: requestedQty } }, { $inc: { availableQuantity: -requestedQty } })`
   - If `matchedCount == 0`, a `BadRequestException("Insufficient available stock for asset")` is raised.
3. **Safe Return Restoration**:
   - Returned equipment in `GOOD` or `FAIR` condition immediately restores `availableQuantity += returnedQty`.
   - Equipment returned in `DAMAGED` or `POOR` condition updates asset status to `DAMAGED` or `MAINTENANCE`, preventing uninspected reassignment.

