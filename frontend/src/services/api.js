import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Fallback initial dataset matching the PRD seed data
const initialAssets = [
  {
    id: "1",
    assetId: "RB-ESP32-014",
    name: "ESP32 Development Board",
    category: "DEVELOPMENT_BOARDS",
    brand: "Espressif",
    model: "ESP32-WROOM-32",
    serialNumber: "ESP32X01492",
    quantity: 15,
    location: "Robotics Lab - Rack B2",
    status: "AVAILABLE",
    condition: "GOOD",
    description: "Dual-core 240MHz Wi-Fi and Bluetooth MCU board",
    purchaseDate: "2025-08-10"
  },
  {
    id: "2",
    assetId: "RB-STM32-001",
    name: "STM32 Nucleo-F401RE",
    category: "DEVELOPMENT_BOARDS",
    brand: "STMicroelectronics",
    model: "NUCLEO-F401RE",
    serialNumber: "STM32F4-9901",
    quantity: 10,
    location: "Robotics Lab - Rack A1",
    status: "IN_USE",
    condition: "GOOD",
    description: "ARM Cortex-M4 microcontroller board with mbed support",
    allocatedProjectName: "Autonomous Delivery Robot",
    purchaseDate: "2025-06-15"
  },
  {
    id: "3",
    assetId: "RB-MOTOR-027",
    name: "NEMA 17 Stepper Motor",
    category: "MOTORS",
    brand: "StepperOnline",
    model: "17HS4401",
    serialNumber: "MOT-17-440127",
    quantity: 8,
    location: "Robotics Lab - Rack C3",
    status: "AVAILABLE",
    condition: "GOOD",
    description: "1.8 deg, 40Ncm holding torque, 1.7A per phase",
    purchaseDate: "2025-09-20"
  },
  {
    id: "4",
    assetId: "RB-SENSOR-042",
    name: "HC-SR04 Ultrasonic Sensor",
    category: "SENSORS",
    brand: "SparkFun",
    model: "HC-SR04",
    serialNumber: "US-SR04-0042",
    quantity: 20,
    location: "Robotics Lab - Drawer 4",
    status: "AVAILABLE",
    condition: "GOOD",
    description: "Ultrasonic distance ranging module (2cm - 400cm)",
    purchaseDate: "2025-05-12"
  },
  {
    id: "5",
    assetId: "RB-LIDAR-005",
    name: "RPLIDAR A1 360 Laser Scanner",
    category: "SENSORS",
    brand: "Slamtec",
    model: "A1M8-R6",
    serialNumber: "SLAM-A1-8831",
    quantity: 3,
    location: "Robotics Lab - Sensor Bay",
    status: "IN_USE",
    condition: "GOOD",
    description: "360-degree 2D laser scanner for SLAM and mapping (12m range)",
    allocatedProjectName: "Autonomous Delivery Robot",
    purchaseDate: "2025-11-04"
  },
  {
    id: "6",
    assetId: "RB-OSC-003",
    name: "Digital Storage Oscilloscope 100MHz",
    category: "TEST_EQUIPMENT",
    brand: "Rigol",
    model: "DS1054Z",
    serialNumber: "RIG-DS1054-003",
    quantity: 4,
    location: "Robotics Lab - Test Bench 2",
    status: "MAINTENANCE",
    condition: "FAIR",
    description: "4 Channels 50MHz-100MHz digital oscilloscope",
    purchaseDate: "2024-04-18"
  }
];

export const assetApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/assets');
      return res.data;
    } catch (e) {
      console.warn("Backend API not reachable, loading fallback cache:", e.message);
      return initialAssets;
    }
  },
  getById: async (id) => {
    try {
      const res = await apiClient.get(`/assets/${id}`);
      return res.data;
    } catch (e) {
      return initialAssets.find(a => a.id === id || a.assetId === id);
    }
  },
  create: async (data) => {
    const res = await apiClient.post('/assets', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/assets/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/assets/${id}`);
    return res.data;
  },
  search: async (query, category, status) => {
    try {
      const params = {};
      if (query) params.query = query;
      if (category) params.category = category;
      if (status) params.status = status;
      const res = await apiClient.get('/assets/search', { params });
      return res.data;
    } catch (e) {
      return initialAssets.filter(a => {
        const matchesQ = !query || a.name.toLowerCase().includes(query.toLowerCase()) || a.assetId.toLowerCase().includes(query.toLowerCase());
        const matchesCat = !category || a.category === category;
        const matchesStatus = !status || a.status === status;
        return matchesQ && matchesCat && matchesStatus;
      });
    }
  }
};

export const checkoutApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/checkouts');
      return res.data;
    } catch (e) {
      return [
        {
          id: "chk-1",
          assetId: "RB-STM32-001",
          assetName: "STM32 Nucleo-F401RE",
          userName: "John Doe",
          projectName: "Autonomous Delivery Robot",
          status: "ISSUED",
          purpose: "Motor control prototyping and encoder feedback setup",
          expectedReturnDate: "2026-11-01",
          requestedAt: "2026-10-15T10:00:00"
        }
      ];
    }
  },
  request: async (data) => {
    const res = await apiClient.post('/checkouts', data);
    return res.data;
  },
  approve: async (id, approvedBy) => {
    const res = await apiClient.put(`/checkouts/${id}/approve`, { approvedBy });
    return res.data;
  },
  reject: async (id, remarks) => {
    const res = await apiClient.put(`/checkouts/${id}/reject`, { remarks });
    return res.data;
  },
  issue: async (id, issuedBy) => {
    const res = await apiClient.put(`/checkouts/${id}/issue`, { issuedBy });
    return res.data;
  },
  returnItem: async (id, returnCondition, remarks) => {
    const res = await apiClient.put(`/checkouts/${id}/return`, { returnCondition, remarks });
    return res.data;
  }
};

export const maintenanceApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/maintenance');
      return res.data;
    } catch (e) {
      return [
        {
          id: "m-1",
          assetId: "RB-OSC-003",
          assetName: "Digital Storage Oscilloscope 100MHz",
          issueDescription: "Channel 1 BNC connector loose and probe ground connection intermittent",
          diagnosis: "Cold solder joint on internal input attenuator board",
          actionTaken: "Reflowed BNC connector joints and replaced probe socket spring",
          partsReplaced: "BNC Jack Receptacle PCB Mount",
          cost: 14.50,
          technicianName: "Alex Rivera",
          status: "IN_REPAIR",
          reportedDate: "2026-10-18T14:30:00"
        }
      ];
    }
  },
  create: async (data) => {
    const res = await apiClient.post('/maintenance', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/maintenance/${id}`, data);
    return res.data;
  }
};

export const projectApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/projects');
      return res.data;
    } catch (e) {
      return [
        {
          id: "prj-1",
          code: "PRJ-ADR-01",
          name: "Autonomous Delivery Robot",
          description: "Indoor autonomous delivery rover with lidar obstacle avoidance and ROS2 navigation",
          projectLead: "John Doe",
          teamMembers: ["John Doe", "Maya Lin", "David Park"],
          allocatedAssetIds: ["RB-STM32-001", "RB-LIDAR-005", "RB-DRV-011"],
          status: "ACTIVE"
        },
        {
          id: "prj-2",
          code: "PRJ-UAV-02",
          name: "Autonomous Drone Quadcopter",
          description: "Quadcopter platform for visual precision landing using OpenCV and ESP32 telemetry",
          projectLead: "Maya Lin",
          teamMembers: ["Maya Lin", "Samir Patel"],
          allocatedAssetIds: [],
          status: "ACTIVE"
        }
      ];
    }
  },
  create: async (data) => {
    const res = await apiClient.post('/projects', data);
    return res.data;
  },
  allocateAsset: async (projectId, assetId) => {
    const res = await apiClient.post(`/projects/${projectId}/allocate/${assetId}`);
    return res.data;
  },
  deallocateAsset: async (projectId, assetId) => {
    const res = await apiClient.delete(`/projects/${projectId}/allocate/${assetId}`);
    return res.data;
  }
};

export const faultApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/faults');
      return res.data;
    } catch (e) {
      return [
        {
          id: "flt-1",
          assetId: "RB-PWR-007",
          assetName: "4S 14.8V 5200mAh LiPo Battery",
          reportedBy: "Maya Lin",
          title: "LiPo Battery cell 3 voltage drops under 2.8V",
          description: "Discovered during drone hover test; alarm was triggered. Swelled slightly.",
          severity: "HIGH",
          status: "IN_MAINTENANCE"
        }
      ];
    }
  },
  create: async (data) => {
    const res = await apiClient.post('/faults', data);
    return res.data;
  },
  sendToMaintenance: async (id, technicianName) => {
    const res = await apiClient.post(`/faults/${id}/send-to-maintenance`, { technicianName });
    return res.data;
  }
};

export const dashboardApi = {
  getSummary: async () => {
    try {
      const res = await apiClient.get('/dashboard/summary');
      return res.data;
    } catch (e) {
      return {
        totalAssets: 10,
        availableAssets: 6,
        inUseAssets: 3,
        maintenanceAssets: 1,
        damagedAssets: 1,
        overdueAssets: 0,
        activeProjects: 2,
        openFaultReports: 1,
        recentActivity: [
          {
            id: "act-1",
            action: "SYSTEM_INIT",
            entityType: "SYSTEM",
            description: "RoboVault platform initialized with laboratory asset catalog",
            performedBy: "System",
            timestamp: new Date().toISOString()
          },
          {
            id: "act-2",
            action: "EQUIPMENT_ISSUED",
            entityType: "CHECKOUT",
            description: "Asset STM32 Nucleo-F401RE issued to John Doe",
            performedBy: "Alex Rivera",
            timestamp: new Date().toISOString()
          }
        ]
      };
    }
  }
};

export default apiClient;

