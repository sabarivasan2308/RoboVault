# RoboVault REST API Documentation & Integration Guide

The RoboVault REST API is secured via JWT bearer tokens and adheres strictly to standard HTTP status codes, structured JSON responses, and role-based permissions.

Interactive OpenAPI documentation is live at:
`http://localhost:8080/swagger-ui.html` or `http://localhost/swagger-ui.html`

---

## 1. Authentication Endpoints

### 1.1. Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@robovault.io",
  "password": "Password123!"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "id": "660c1f5e2a9b4c001f3e1a01",
    "username": "admin",
    "email": "admin@robovault.io",
    "fullName": "System Administrator",
    "role": "ADMIN",
    "department": "Robotics & Automation"
  }
}
```
- **Example Curl**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@robovault.io","password":"Password123!"}'
```

### 1.2. Get Current Authenticated User
- **Endpoint**: `GET /api/auth/me`
- **Access**: Any authenticated user
- **Header**: `Authorization: Bearer <JWT_TOKEN>`

---

## 2. Asset Management Endpoints

### 2.1. List Assets (Paginated & Filterable)
- **Endpoint**: `GET /api/assets`
- **Parameters**: `page` (default 0), `size` (default 20), `category`, `status`, `condition`, `search`
- **Access**: Authenticated

### 2.2. Create Asset
- **Endpoint**: `POST /api/assets`
- **Access**: `ADMIN`, `LAB_ASSISTANT`
- **Request Body**:
```json
{
  "assetId": "RB-STM32-002",
  "name": "STM32 Nucleo-64",
  "category": "MICROCONTROLLER",
  "brand": "STMicroelectronics",
  "model": "NUCLEO-F401RE",
  "serialNumber": "NUC-2024-0091",
  "quantity": 15,
  "location": "Robotics Lab - Shelf B1",
  "status": "AVAILABLE",
  "condition": "GOOD",
  "purchaseDate": "2024-02-10",
  "description": "ARM Cortex-M4 microcontroller board."
}
```

### 2.3. Update Asset
- **Endpoint**: `PUT /api/assets/{id}`
- **Access**: `ADMIN`, `LAB_ASSISTANT`

### 2.4. Delete Asset (Safe Check)
- **Endpoint**: `DELETE /api/assets/{id}`
- **Access**: `ADMIN`
- **Behavior**: Verifies that no active checkouts, allocations, or open maintenance jobs are linked to the asset before deletion.

---

## 3. Checkouts & Custody Endpoints

### 3.1. Submit Checkout Request
- **Endpoint**: `POST /api/checkouts`
- **Access**: Any authenticated user (`STUDENT`, `FACULTY`, etc.)
- **Request Body**:
```json
{
  "assetId": "RB-STM32-001",
  "quantity": 1,
  "projectId": "PRJ-AUTONOMOUS-ROVER",
  "dueDate": "2026-10-30T17:00:00Z",
  "notes": "Required for embedded sensors class project"
}
```

### 3.2. Approve Request
- **Endpoint**: `POST /api/checkouts/{id}/approve`
- **Access**: `ADMIN`, `LAB_ASSISTANT`
- **Request Body**:
```json
{
  "approverNotes": "Approved for lab assignment"
}
```

### 3.3. Reject Request
- **Endpoint**: `POST /api/checkouts/{id}/reject`
- **Access**: `ADMIN`, `LAB_ASSISTANT`
- **Request Body**:
```json
{
  "rejectionReason": "Requested quantity exceeds individual allocation limits."
}
```

### 3.4. Issue Equipment
- **Endpoint**: `POST /api/checkouts/{id}/issue`
- **Access**: `ADMIN`, `LAB_ASSISTANT`
- **Request Body**:
```json
{
  "issueCondition": "GOOD",
  "notes": "Verified all header pins and USB cables present."
}
```

### 3.5. Process Return & Condition Audit
- **Endpoint**: `POST /api/checkouts/{id}/return`
- **Access**: `ADMIN`, `LAB_ASSISTANT`
- **Request Body**:
```json
{
  "returnCondition": "GOOD",
  "notes": "Returned on time in clean condition."
}
```

---

## 4. Maintenance & Work-Orders Endpoints

### 4.1. Open Maintenance Case
- **Endpoint**: `POST /api/maintenance`
- **Access**: `ADMIN`, `LAB_ASSISTANT`
- **Request Body**:
```json
{
  "assetId": "RB-ROBOT-001",
  "priority": "HIGH",
  "issueDescription": "LiDAR belt slippage under heavy rotational load.",
  "assignedTechnician": "Alex Rivera"
}
```

### 4.2. Diagnose
- **Endpoint**: `POST /api/maintenance/{id}/diagnose`
- **Access**: `ADMIN`, `LAB_ASSISTANT`

### 4.3. Resolve Work Order
- **Endpoint**: `POST /api/maintenance/{id}/resolve`
- **Access**: `ADMIN`, `LAB_ASSISTANT`
- **Request Body**:
```json
{
  "actionsTaken": "Tensioned belt, replaced worn idler pulley.",
  "partsReplaced": ["Idler Pulley 12T", "GT2 Timing Belt"],
  "cost": 18.50
}
```

### 4.4. Close Maintenance Order
- **Endpoint**: `POST /api/maintenance/{id}/close`
- **Access**: `ADMIN`, `LAB_ASSISTANT`
- **Behavior**: Transitions asset back to `AVAILABLE` status and updates operational inventory.

---

## 5. Dashboard Summary Endpoint

### 5.1. Aggregate Lab Statistics
- **Endpoint**: `GET /api/dashboard/summary`
- **Access**: Authenticated
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "totalAssets": 45,
    "availableUnits": 38,
    "inUseUnits": 5,
    "maintenanceUnits": 2,
    "damagedUnits": 0,
    "pendingCheckouts": 3,
    "overdueCheckouts": 0,
    "openFaultReports": 1,
    "utilizationRate": 11.1,
    "statusDistribution": {
      "AVAILABLE": 38,
      "IN_USE": 5,
      "MAINTENANCE": 2
    },
    "categoryDistribution": {
      "MICROCONTROLLER": 12,
      "SENSORS": 18,
      "ROBOTS": 6
    },
    "recentOverdue": [],
    "recentActivity": []
  }
}
```

---

## 6. User Management (Admin Only)

- `GET /api/users`: List users
- `POST /api/users`: Create user account
- `PUT /api/users/{id}`: Modify user profile and role
- `PATCH /api/users/{id}/status`: Toggle active status (`{ "active": false }`)
