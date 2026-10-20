# RoboVault Testing & Quality Assurance Guide

This guide details automated unit testing, integration tests, and verification procedures for data persistence and Docker container lifecycle.

---

## 1. Backend Automated Testing

RoboVault backend includes comprehensive **JUnit 5** and **Mockito** unit tests covering business validation, stock invariants, role access, and state machines.

### 1.1. Executing Backend Tests
From the `backend` directory or project root:

```bash
# Within the backend directory
cd backend
mvn clean test
```

### 1.2. Key Test Suites
- **`AssetServiceTest`**:
  - `testCreateAssetSuccess()`: Ensures new assets validate required fields, assign unique identifiers, and initialize default statuses.
  - `testDuplicateAssetIdThrowsException()`: Asserts that attempting to register an existing `assetId` triggers a `BadRequestException`.
  - `testSafeDeletionProtection()`: Confirms that assets tied to active checkouts or maintenance work orders cannot be deleted.
- **`CheckoutServiceTest`**:
  - `testCheckoutCreationSuccess()`: Verifies that submitting a valid request reserves stock correctly.
  - `testOverStockCheckoutRejected()`: Asserts that requesting more units than `availableQuantity` rejects the transaction without mutating state.
  - `testReturnConditionInspection()`: Asserts that returning an asset marked `DAMAGED` automatically updates asset condition and prevents instant re-borrowing.

---

## 2. Frontend Build Verification

To verify that the React 18 / Vite frontend builds cleanly with zero compilation errors:

```bash
cd frontend
npm install
npm run build
```

This compiles static assets into `frontend/dist/`.

---

## 3. Persistent Volume & Docker Recovery Verification

Follow this end-to-end procedure to verify that data survives container teardown:

### Step 1: Start Clean Environment
```bash
docker compose up -d
```

### Step 2: Seed or Create a Test Asset
Submit a test asset via curl:
```bash
curl -X POST http://localhost:8080/api/assets \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "RB-PERSIST-TEST",
    "name": "Persistence Verification Probe",
    "category": "TEST_EQUIPMENT",
    "quantity": 1,
    "location": "Bench 4"
  }'
```

### Step 3: Tear Down Containers (Keep Volume Intact)
```bash
docker compose down
```
*Note: Do NOT pass the `-v` flag, which would destroy named volumes.*

### Step 4: Restart Containers
```bash
docker compose up -d
```

### Step 5: Query for Test Asset
```bash
curl -X GET http://localhost:8080/api/assets \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```
Verify that `"RB-PERSIST-TEST"` is returned in the collection, proving persistence on the `mongo_data` Docker volume.

---

## 4. Health Checks & Observability

Spring Boot Actuator endpoints provide real-time container health:
- **Liveness & Readiness**:
  `GET http://localhost:8080/actuator/health`
- **Application Metrics**:
  `GET http://localhost:8080/actuator/metrics`
