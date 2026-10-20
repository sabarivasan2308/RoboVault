package com.robovault.util;

import com.robovault.model.*;
import com.robovault.repository.*;
import com.robovault.service.ActivityLogService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final CheckoutRecordRepository checkoutRecordRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final FaultReportRepository faultReportRepository;
    private final ActivityLogService activityLogService;

    public DataInitializer(AssetRepository assetRepository,
                           UserRepository userRepository,
                           ProjectRepository projectRepository,
                           CheckoutRecordRepository checkoutRecordRepository,
                           MaintenanceRecordRepository maintenanceRecordRepository,
                           FaultReportRepository faultReportRepository,
                           ActivityLogService activityLogService) {
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.checkoutRecordRepository = checkoutRecordRepository;
        this.maintenanceRecordRepository = maintenanceRecordRepository;
        this.faultReportRepository = faultReportRepository;
        this.activityLogService = activityLogService;
    }

    @Override
    public void run(String... args) {
        if (assetRepository.count() > 0) {
            return; // Data already exists
        }

        System.out.println("Initializing RoboVault sample data...");

        // 1. Seed Users
        User admin = new User("admin", "Dr. Sarah Chen", "admin@robovault.edu", "Robotics & AI", UserRole.ADMIN, "FAC-082");
        User assistant = new User("arivera", "Alex Rivera", "arivera@robovault.edu", "Robotics Lab", UserRole.ASSISTANT, "STAFF-019");
        User student = new User("jdoe", "John Doe", "jdoe@student.edu", "Mechatronics", UserRole.STUDENT, "STU-2024-991");
        userRepository.saveAll(Arrays.asList(admin, assistant, student));

        // 2. Seed Projects
        Project project1 = new Project("PRJ-ADR-01", "Autonomous Delivery Robot",
                "Indoor autonomous delivery rover with lidar obstacle avoidance and ROS2 navigation", "John Doe");
        project1.setTeamMembers(Arrays.asList("John Doe", "Maya Lin", "David Park"));
        project1.setStartDate("2026-09-01");
        project1.setTargetCompletionDate("2026-12-15");
        projectRepository.save(project1);

        Project project2 = new Project("PRJ-UAV-02", "Autonomous Drone Quadcopter",
                "Quadcopter platform for visual precision landing using OpenCV and ESP32 telemetry", "Maya Lin");
        project2.setTeamMembers(Arrays.asList("Maya Lin", "Samir Patel"));
        project2.setStartDate("2026-10-01");
        project2.setTargetCompletionDate("2027-01-20");
        projectRepository.save(project2);

        // 3. Seed Assets
        Asset esp32 = new Asset("RB-ESP32-014", "ESP32 Development Board", AssetCategory.DEVELOPMENT_BOARDS,
                "Espressif", "ESP32-WROOM-32", "ESP32X01492", 15, "Robotics Lab - Rack B2",
                AssetStatus.AVAILABLE, "GOOD", "Dual-core 240MHz Wi-Fi and Bluetooth MCU board");
        esp32.setPurchaseDate("2025-08-10");

        Asset stm32 = new Asset("RB-STM32-001", "STM32 Nucleo-F401RE", AssetCategory.DEVELOPMENT_BOARDS,
                "STMicroelectronics", "NUCLEO-F401RE", "STM32F4-9901", 10, "Robotics Lab - Rack A1",
                AssetStatus.IN_USE, "GOOD", "ARM Cortex-M4 microcontroller board with mbed support");
        stm32.setPurchaseDate("2025-06-15");
        stm32.setAllocatedProjectId(project1.getId());
        stm32.setAllocatedProjectName(project1.getName());

        Asset motor = new Asset("RB-MOTOR-027", "NEMA 17 Stepper Motor", AssetCategory.MOTORS,
                "StepperOnline", "17HS4401", "MOT-17-440127", 8, "Robotics Lab - Rack C3",
                AssetStatus.AVAILABLE, "GOOD", "1.8 deg, 40Ncm holding torque, 1.7A per phase");
        motor.setPurchaseDate("2025-09-20");

        Asset sensor = new Asset("RB-SENSOR-042", "HC-SR04 Ultrasonic Sensor", AssetCategory.SENSORS,
                "SparkFun", "HC-SR04", "US-SR04-0042", 20, "Robotics Lab - Drawer 4",
                AssetStatus.AVAILABLE, "GOOD", "Ultrasonic distance ranging module (2cm - 400cm)");
        sensor.setPurchaseDate("2025-05-12");

        Asset lidar = new Asset("RB-LIDAR-005", "RPLIDAR A1 360 Laser Scanner", AssetCategory.SENSORS,
                "Slamtec", "A1M8-R6", "SLAM-A1-8831", 3, "Robotics Lab - Sensor Bay",
                AssetStatus.IN_USE, "GOOD", "360-degree 2D laser scanner for SLAM and mapping (12m range)");
        lidar.setPurchaseDate("2025-11-04");
        lidar.setAllocatedProjectId(project1.getId());
        lidar.setAllocatedProjectName(project1.getName());

        Asset driver = new Asset("RB-DRV-011", "L298N Dual H-Bridge Motor Driver", AssetCategory.MOTOR_DRIVERS,
                "STMicroelectronics", "L298N", "DRV-L298-011", 12, "Robotics Lab - Rack C1",
                AssetStatus.IN_USE, "GOOD", "Dual full-bridge driver up to 46V 2A per channel");
        driver.setPurchaseDate("2025-07-19");
        driver.setAllocatedProjectId(project1.getId());
        driver.setAllocatedProjectName(project1.getName());

        Asset arm = new Asset("RB-ROBOT-002", "6-DOF Robotic Arm Kit", AssetCategory.ROBOTS,
                "LewanSoul", "xArm 1S", "ROB-XARM-002", 2, "Robotics Lab - Bench 1",
                AssetStatus.AVAILABLE, "GOOD", "Bus servo robotic arm with suction cup & controller");
        arm.setPurchaseDate("2025-03-10");

        Asset printer = new Asset("RB-PRINT-001", "Prusa i3 MK3S+ 3D Printer", AssetCategory.THREE_D_PRINTERS,
                "Prusa Research", "MK3S+", "PRU-MK3S-001", 1, "Fabrication Lab - Room 102",
                AssetStatus.AVAILABLE, "GOOD", "High precision FDM 3D printer with direct drive extruder");
        printer.setPurchaseDate("2024-11-20");

        Asset scope = new Asset("RB-OSC-003", "Digital Storage Oscilloscope 100MHz", AssetCategory.TEST_EQUIPMENT,
                "Rigol", "DS1054Z", "RIG-DS1054-003", 4, "Robotics Lab - Test Bench 2",
                AssetStatus.MAINTENANCE, "FAIR", "4 Channels 50MHz-100MHz digital oscilloscope");
        scope.setPurchaseDate("2024-04-18");

        Asset battery = new Asset("RB-PWR-007", "4S 14.8V 5200mAh LiPo Battery", AssetCategory.POWER_SUPPLIES,
                "Gens ace", "B-50C-5200-4S1P", "PWR-LIPO-007", 6, "Robotics Lab - Safety Cabinet",
                AssetStatus.DAMAGED, "DAMAGED", "High discharge battery pack - cell 3 unbalanced voltage");
        battery.setPurchaseDate("2025-02-14");

        assetRepository.saveAll(Arrays.asList(esp32, stm32, motor, sensor, lidar, driver, arm, printer, scope, battery));

        // Update Project 1 allocated list
        project1.getAllocatedAssetIds().addAll(Arrays.asList(stm32.getAssetId(), lidar.getAssetId(), driver.getAssetId()));
        projectRepository.save(project1);

        // 4. Seed Checkout Record
        CheckoutRecord checkout = new CheckoutRecord();
        checkout.setAssetId(stm32.getAssetId());
        checkout.setAssetMongoId(stm32.getId());
        checkout.setAssetName(stm32.getName());
        checkout.setUserId(student.getId());
        checkout.setUserName(student.getFullName());
        checkout.setUserEmail(student.getEmail());
        checkout.setProjectId(project1.getId());
        checkout.setProjectName(project1.getName());
        checkout.setStatus(CheckoutStatus.ISSUED);
        checkout.setPurpose("Motor control prototyping and encoder feedback setup for delivery robot");
        checkout.setRequestedAt(LocalDateTime.now().minusDays(5));
        checkout.setApprovedAt(LocalDateTime.now().minusDays(4));
        checkout.setApprovedBy("Dr. Sarah Chen");
        checkout.setIssuedAt(LocalDateTime.now().minusDays(4));
        checkout.setIssuedBy("Alex Rivera");
        checkout.setExpectedReturnDate(LocalDateTime.now().plusDays(10).toLocalDate().toString());
        checkoutRecordRepository.save(checkout);

        // 5. Seed Maintenance Record
        MaintenanceRecord maint = new MaintenanceRecord();
        maint.setAssetId(scope.getAssetId());
        maint.setAssetMongoId(scope.getId());
        maint.setAssetName(scope.getName());
        maint.setIssueDescription("Channel 1 BNC connector loose and probe ground connection intermittent");
        maint.setDiagnosis("Cold solder joint on internal input attenuator board");
        maint.setActionTaken("Reflowed BNC connector joints and replaced probe socket spring");
        maint.setPartsReplaced("BNC Jack Receptacle PCB Mount");
        maint.setCost(14.50);
        maint.setTechnicianName("Alex Rivera");
        maint.setStatus(MaintenanceStatus.IN_REPAIR);
        maint.setReportedDate(LocalDateTime.now().minusDays(2));
        maintenanceRecordRepository.save(maint);

        // 6. Seed Fault Report
        FaultReport fault = new FaultReport(battery.getAssetId(), battery.getName(),
                "Maya Lin", "LiPo Battery cell 3 voltage drops under 2.8V",
                "Discovered during drone hover test; alarm was triggered. Swelled slightly.", FaultSeverity.HIGH);
        fault.setStatus("IN_MAINTENANCE");
        faultReportRepository.save(fault);

        // 7. Seed Initial Activity Logs
        activityLogService.log("SYSTEM_INIT", "SYSTEM", "SYS-001", "RoboVault platform initialized with laboratory asset catalog", "System");
        activityLogService.log("EQUIPMENT_ISSUED", "CHECKOUT", checkout.getId(), "Asset " + stm32.getName() + " issued to " + student.getFullName(), "Alex Rivera");
        activityLogService.log("MAINTENANCE_CREATED", "MAINTENANCE", maint.getId(), "Maintenance started for " + scope.getName(), "Alex Rivera");

        System.out.println("RoboVault sample data successfully seeded!");
    }
}

