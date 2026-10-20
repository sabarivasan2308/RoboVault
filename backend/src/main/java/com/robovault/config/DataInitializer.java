package com.robovault.config;

import com.robovault.activity.service.ActivityLogService;
import com.robovault.assets.model.Asset;
import com.robovault.assets.model.AssetCategory;
import com.robovault.assets.model.AssetStatus;
import com.robovault.assets.model.PhysicalCondition;
import com.robovault.assets.repository.AssetRepository;
import com.robovault.checkouts.model.CheckoutRecord;
import com.robovault.checkouts.model.CheckoutStatus;
import com.robovault.checkouts.repository.CheckoutRecordRepository;
import com.robovault.faults.model.FaultReport;
import com.robovault.faults.model.FaultSeverity;
import com.robovault.faults.model.FaultStatus;
import com.robovault.faults.repository.FaultReportRepository;
import com.robovault.maintenance.model.MaintenancePriority;
import com.robovault.maintenance.model.MaintenanceRecord;
import com.robovault.maintenance.model.MaintenanceStatus;
import com.robovault.maintenance.repository.MaintenanceRecordRepository;
import com.robovault.projects.model.Project;
import com.robovault.projects.model.ProjectAllocation;
import com.robovault.projects.model.ProjectStatus;
import com.robovault.projects.repository.ProjectRepository;
import com.robovault.users.model.User;
import com.robovault.users.model.UserRole;
import com.robovault.users.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final ProjectRepository projectRepository;
    private final CheckoutRecordRepository checkoutRepository;
    private final MaintenanceRecordRepository maintenanceRepository;
    private final FaultReportRepository faultRepository;
    private final ActivityLogService activityLogService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           AssetRepository assetRepository,
                           ProjectRepository projectRepository,
                           CheckoutRecordRepository checkoutRepository,
                           MaintenanceRecordRepository maintenanceRepository,
                           FaultReportRepository faultRepository,
                           ActivityLogService activityLogService,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
        this.projectRepository = projectRepository;
        this.checkoutRepository = checkoutRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.faultRepository = faultRepository;
        this.activityLogService = activityLogService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Idempotent: data already exists
        }

        System.out.println("⚡ Seeding RoboVault institutional development catalog...");

        // 1. Seed Users (ADMIN, LAB_ASSISTANT, FACULTY, STUDENT)
        User admin = new User("admin@robovault.edu", passwordEncoder.encode("Admin@123456"),
                "Dr. Sarah Chen", "Robotics & Autonomous Systems", "FAC-001", UserRole.ADMIN);

        User assistant = new User("assistant@robovault.edu", passwordEncoder.encode("Assistant@123456"),
                "Alex Rivera", "Robotics Lab Facility", "STAFF-019", UserRole.LAB_ASSISTANT);

        User faculty = new User("faculty@robovault.edu", passwordEncoder.encode("Faculty@123456"),
                "Prof. Marcus Vance", "Mechatronics Department", "FAC-044", UserRole.FACULTY);

        User student = new User("student@robovault.edu", passwordEncoder.encode("Student@123456"),
                "John Doe", "Robotics Capstone Team", "STU-2024-991", UserRole.STUDENT);

        userRepository.saveAll(Arrays.asList(admin, assistant, faculty, student));

        // 2. Seed Projects
        Project prj1 = new Project("PRJ-ADR-01", "Autonomous Delivery Robot",
                "Indoor autonomous delivery rover with lidar obstacle avoidance and ROS2 navigation", "Prof. Marcus Vance");
        prj1.setTeamMembers(Arrays.asList("John Doe", "Maya Lin", "David Park"));
        prj1.setStartDate("2026-09-01");
        prj1.setExpectedCompletionDate("2026-12-15");
        prj1.setStatus(ProjectStatus.ACTIVE);

        Project prj2 = new Project("PRJ-UAV-02", "Precision Landing Quadcopter",
                "Quadcopter platform for visual precision landing using OpenCV and ESP32 telemetry", "Prof. Marcus Vance");
        prj2.setTeamMembers(Arrays.asList("Maya Lin", "Samir Patel"));
        prj2.setStartDate("2026-10-01");
        prj2.setExpectedCompletionDate("2027-01-20");
        prj2.setStatus(ProjectStatus.ACTIVE);

        projectRepository.saveAll(Arrays.asList(prj1, prj2));

        // 3. Seed Assets across ALL 12 Categories
        Asset esp32 = new Asset("RB-ESP32-014", "ESP32 Development Board", AssetCategory.DEVELOPMENT_BOARDS,
                "Espressif", "ESP32-WROOM-32", "ESP32X01492", 15, "Robotics Lab - Rack B2",
                AssetStatus.AVAILABLE, PhysicalCondition.GOOD, "Dual-core 240MHz Wi-Fi and Bluetooth MCU board");
        esp32.setAvailableQuantity(15);
        esp32.setPurchaseDate("2025-08-10");

        Asset stm32 = new Asset("RB-STM32-001", "STM32 Nucleo-F401RE", AssetCategory.DEVELOPMENT_BOARDS,
                "STMicroelectronics", "NUCLEO-F401RE", "STM32F4-9901", 10, "Robotics Lab - Rack A1",
                AssetStatus.IN_USE, PhysicalCondition.GOOD, "ARM Cortex-M4 microcontroller board with mbed support");
        stm32.setAvailableQuantity(8);
        stm32.setPurchaseDate("2025-06-15");
        stm32.setAllocatedProjectId(prj1.getId());
        stm32.setAllocatedProjectName(prj1.getName());

        Asset motor = new Asset("RB-MOTOR-027", "NEMA 17 Stepper Motor", AssetCategory.MOTORS,
                "StepperOnline", "17HS4401", "MOT-17-440127", 8, "Robotics Lab - Rack C3",
                AssetStatus.AVAILABLE, PhysicalCondition.GOOD, "1.8 deg, 40Ncm holding torque, 1.7A per phase");
        motor.setAvailableQuantity(8);
        motor.setPurchaseDate("2025-09-20");

        Asset sensor = new Asset("RB-SENSOR-042", "HC-SR04 Ultrasonic Sensor", AssetCategory.SENSORS,
                "SparkFun", "HC-SR04", "US-SR04-0042", 20, "Robotics Lab - Drawer 4",
                AssetStatus.AVAILABLE, PhysicalCondition.GOOD, "Ultrasonic distance ranging module (2cm - 400cm)");
        sensor.setAvailableQuantity(20);
        sensor.setPurchaseDate("2025-05-12");

        Asset lidar = new Asset("RB-LIDAR-005", "RPLIDAR A1 360 Laser Scanner", AssetCategory.SENSORS,
                "Slamtec", "A1M8-R6", "SLAM-A1-8831", 3, "Robotics Lab - Sensor Bay",
                AssetStatus.IN_USE, PhysicalCondition.GOOD, "360-degree 2D laser scanner for SLAM (12m range)");
        lidar.setAvailableQuantity(1);
        lidar.setAllocatedProjectId(prj1.getId());
        lidar.setAllocatedProjectName(prj1.getName());

        Asset driver = new Asset("RB-DRV-011", "L298N Dual H-Bridge Motor Driver", AssetCategory.MOTOR_DRIVERS,
                "STMicroelectronics", "L298N", "DRV-L298-011", 12, "Robotics Lab - Rack C1",
                AssetStatus.AVAILABLE, PhysicalCondition.GOOD, "Dual full-bridge driver up to 46V 2A per channel");
        driver.setAvailableQuantity(12);

        Asset arm = new Asset("RB-ROBOT-002", "6-DOF Robotic Arm Kit", AssetCategory.ROBOTS,
                "LewanSoul", "xArm 1S", "ROB-XARM-002", 2, "Robotics Lab - Bench 1",
                AssetStatus.AVAILABLE, PhysicalCondition.GOOD, "Bus servo robotic arm with suction cup & controller");
        arm.setAvailableQuantity(2);

        Asset printer = new Asset("RB-PRINT-001", "Prusa i3 MK3S+ 3D Printer", AssetCategory.THREE_D_PRINTERS,
                "Prusa Research", "MK3S+", "PRU-MK3S-001", 1, "Fabrication Lab - Room 102",
                AssetStatus.AVAILABLE, PhysicalCondition.GOOD, "High precision FDM 3D printer");
        printer.setAvailableQuantity(1);

        Asset scope = new Asset("RB-OSC-003", "Digital Storage Oscilloscope 100MHz", AssetCategory.TEST_EQUIPMENT,
                "Rigol", "DS1054Z", "RIG-DS1054-003", 4, "Robotics Lab - Test Bench 2",
                AssetStatus.MAINTENANCE, PhysicalCondition.FAIR, "4 Channels 50MHz-100MHz digital oscilloscope");
        scope.setAvailableQuantity(3);

        Asset battery = new Asset("RB-PWR-007", "4S 14.8V 5200mAh LiPo Battery", AssetCategory.POWER_SUPPLIES,
                "Gens ace", "B-50C-5200-4S1P", "PWR-LIPO-007", 6, "Robotics Lab - Safety Cabinet",
                AssetStatus.DAMAGED, PhysicalCondition.DAMAGED, "High discharge battery pack - cell 3 unbalanced voltage");
        battery.setAvailableQuantity(5);

        Asset radio = new Asset("RB-COMM-004", "NRF24L01+ 2.4GHz Wireless Module", AssetCategory.COMMUNICATION_MODULES,
                "Nordic", "NRF24L01+", "COMM-NRF-004", 15, "Robotics Lab - Drawer 2",
                AssetStatus.AVAILABLE, PhysicalCondition.GOOD, "Ultra low power 2Mbps 2.4GHz transceiver");
        radio.setAvailableQuantity(15);

        Asset mcu = new Asset("RB-MCU-008", "ATmega328P Microcontroller DIP-28", AssetCategory.MICROCONTROLLERS,
                "Microchip", "ATmega328P-PU", "MCU-328P-008", 30, "Electronics Bin 1",
                AssetStatus.AVAILABLE, PhysicalCondition.GOOD, "8-bit AVR Microcontroller with 32K Flash");
        mcu.setAvailableQuantity(30);

        Asset comps = new Asset("RB-COMP-019", "Precision Resistor Kit (1/4W 1%)", AssetCategory.ELECTRONIC_COMPONENTS,
                "Vishay", "RN55", "COMP-RES-019", 100, "Component Rack 3",
                AssetStatus.AVAILABLE, PhysicalCondition.GOOD, "Assorted metal film precision resistors");
        comps.setAvailableQuantity(100);

        Asset iron = new Asset("RB-TOOL-005", "Soldering Station 65W Digital", AssetCategory.TOOLS,
                "Hakko", "FX-888D", "TOOL-HAK-005", 5, "Soldering Bench 1",
                AssetStatus.AVAILABLE, PhysicalCondition.GOOD, "Reliable digital temperature soldering iron");
        iron.setAvailableQuantity(5);

        assetRepository.saveAll(Arrays.asList(esp32, stm32, motor, sensor, lidar, driver, arm, printer, scope, battery, radio, mcu, comps, iron));

        // 4. Project Allocation Setup
        ProjectAllocation alloc1 = new ProjectAllocation("ALC-001", stm32.getAssetId(), stm32.getName(), 2, "admin@robovault.edu");
        ProjectAllocation alloc2 = new ProjectAllocation("ALC-002", lidar.getAssetId(), lidar.getName(), 1, "admin@robovault.edu");
        prj1.getAllocatedAssets().addAll(Arrays.asList(alloc1, alloc2));
        projectRepository.save(prj1);

        // 5. Seed Checkout Records (Issued, Returned, and Overdue)
        CheckoutRecord issuedCheckout = new CheckoutRecord();
        issuedCheckout.setRequestId("REQ-001");
        issuedCheckout.setAssetId(stm32.getAssetId());
        issuedCheckout.setAssetName(stm32.getName());
        issuedCheckout.setUserId(student.getId());
        issuedCheckout.setUserName(student.getFullName());
        issuedCheckout.setUserEmail(student.getEmail());
        issuedCheckout.setProjectId(prj1.getId());
        issuedCheckout.setProjectName(prj1.getName());
        issuedCheckout.setRequestedQuantity(2);
        issuedCheckout.setStatus(CheckoutStatus.ISSUED);
        issuedCheckout.setDueDate(LocalDate.now().plusDays(7).toString());
        issuedCheckout.setApprover(admin.getEmail());
        issuedCheckout.setIssuer(assistant.getEmail());
        issuedCheckout.setIssueTimestamp(LocalDateTime.now().minusDays(2));
        issuedCheckout.setNotes("Prototyping odometry encoder feedback");

        CheckoutRecord overdueCheckout = new CheckoutRecord();
        overdueCheckout.setRequestId("REQ-002");
        overdueCheckout.setAssetId(lidar.getAssetId());
        overdueCheckout.setAssetName(lidar.getName());
        overdueCheckout.setUserId(student.getId());
        overdueCheckout.setUserName(student.getFullName());
        overdueCheckout.setUserEmail(student.getEmail());
        overdueCheckout.setProjectId(prj1.getId());
        overdueCheckout.setProjectName(prj1.getName());
        overdueCheckout.setRequestedQuantity(1);
        overdueCheckout.setStatus(CheckoutStatus.ISSUED);
        overdueCheckout.setDueDate(LocalDate.now().minusDays(3).toString());
        overdueCheckout.setOverdue(true);
        overdueCheckout.setApprover(admin.getEmail());
        overdueCheckout.setIssuer(assistant.getEmail());
        overdueCheckout.setIssueTimestamp(LocalDateTime.now().minusDays(10));
        overdueCheckout.setNotes("SLAM map generation in building lobby");

        CheckoutRecord pendingCheckout = new CheckoutRecord();
        pendingCheckout.setRequestId("REQ-003");
        pendingCheckout.setAssetId(motor.getAssetId());
        pendingCheckout.setAssetName(motor.getName());
        pendingCheckout.setUserId(student.getId());
        pendingCheckout.setUserName(student.getFullName());
        pendingCheckout.setUserEmail(student.getEmail());
        pendingCheckout.setRequestedQuantity(2);
        pendingCheckout.setStatus(CheckoutStatus.PENDING);
        pendingCheckout.setDueDate(LocalDate.now().plusDays(14).toString());
        pendingCheckout.setNotes("Bench testing torque limits");

        checkoutRepository.saveAll(Arrays.asList(issuedCheckout, overdueCheckout, pendingCheckout));

        // 6. Seed Maintenance Record
        MaintenanceRecord maint = new MaintenanceRecord();
        maint.setMaintenanceId("MNT-001");
        maint.setAssetId(scope.getAssetId());
        maint.setAssetName(scope.getName());
        maint.setProblemDescription("Channel 1 BNC connector loose and probe ground connection intermittent");
        maint.setDiagnosis("Cold solder joint on internal input attenuator board");
        maint.setMaintenanceType("CORRECTIVE");
        maint.setPriority(MaintenancePriority.HIGH);
        maint.setStatus(MaintenanceStatus.IN_PROGRESS);
        maint.setAssignedTechnician("Alex Rivera");
        maint.setPartsReplaced("BNC Jack Receptacle PCB Mount");
        maint.setRepairCost(14.50);
        maint.setServiceNotes("Part ordered from distributor, awaiting delivery.");
        maintenanceRepository.save(maint);

        // 7. Seed Fault Report
        FaultReport fault = new FaultReport();
        fault.setFaultId("FLT-001");
        fault.setAssetId(battery.getAssetId());
        fault.setAssetName(battery.getName());
        fault.setReporter(student.getFullName());
        fault.setReporterEmail(student.getEmail());
        fault.setFaultTitle("LiPo Battery cell 3 voltage drops under 2.8V");
        fault.setDescription("Discovered during drone hover test; alarm was triggered. Swelled slightly.");
        fault.setSeverity(FaultSeverity.CRITICAL);
        fault.setStatus(FaultStatus.ASSIGNED);
        fault.setAssignedTechnician(assistant.getFullName());
        fault.setLocation("Flight Cage 2");
        faultRepository.save(fault);

        // 8. Seed Activity Logs
        activityLogService.log("System", "SYSTEM_BOOT", "SYSTEM", "SYS-001", "RoboVault enterprise catalog initialized with realistic laboratory assets");
        activityLogService.log(admin.getEmail(), "ASSET_CREATED", "ASSET", stm32.getAssetId(), "Registered asset STM32 Nucleo-F401RE");
        activityLogService.log(assistant.getEmail(), "EQUIPMENT_ISSUED", "CHECKOUT", issuedCheckout.getRequestId(), "Issued 2x STM32 Nucleo-F401RE to John Doe");
        activityLogService.log(assistant.getEmail(), "MAINTENANCE_CREATED", "MAINTENANCE", maint.getMaintenanceId(), "Logged maintenance ticket for Rigol Oscilloscope");

        System.out.println("✓ RoboVault institutional development catalog successfully initialized!");
    }
}
