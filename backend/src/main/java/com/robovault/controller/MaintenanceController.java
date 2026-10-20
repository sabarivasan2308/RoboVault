package com.robovault.controller;

import com.robovault.dto.MaintenanceUpdateDto;
import com.robovault.model.MaintenanceRecord;
import com.robovault.service.MaintenanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "*")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceRecord>> getAllMaintenance() {
        return ResponseEntity.ok(maintenanceService.getAllMaintenanceRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceRecord> getMaintenanceById(@PathVariable String id) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceById(id));
    }

    @PostMapping
    public ResponseEntity<MaintenanceRecord> createMaintenance(@RequestBody MaintenanceRecord record) {
        MaintenanceRecord created = maintenanceService.createMaintenanceRecord(record);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceRecord> updateMaintenance(
            @PathVariable String id,
            @RequestBody MaintenanceUpdateDto dto) {
        return ResponseEntity.ok(maintenanceService.updateMaintenance(id, dto));
    }
}

