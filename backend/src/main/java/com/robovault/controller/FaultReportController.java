package com.robovault.controller;

import com.robovault.model.FaultReport;
import com.robovault.model.MaintenanceRecord;
import com.robovault.service.FaultReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faults")
@CrossOrigin(origins = "*")
public class FaultReportController {

    private final FaultReportService faultReportService;

    public FaultReportController(FaultReportService faultReportService) {
        this.faultReportService = faultReportService;
    }

    @GetMapping
    public ResponseEntity<List<FaultReport>> getAllFaults() {
        return ResponseEntity.ok(faultReportService.getAllFaultReports());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FaultReport> getFaultById(@PathVariable String id) {
        return ResponseEntity.ok(faultReportService.getFaultReportById(id));
    }

    @PostMapping
    public ResponseEntity<FaultReport> createFaultReport(@Valid @RequestBody FaultReport report) {
        return ResponseEntity.status(HttpStatus.CREATED).body(faultReportService.createFaultReport(report));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<FaultReport> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "UNDER_REVIEW");
        return ResponseEntity.ok(faultReportService.updateFaultStatus(id, status));
    }

    @PostMapping("/{id}/send-to-maintenance")
    public ResponseEntity<MaintenanceRecord> sendToMaintenance(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {
        String technician = body != null ? body.get("technicianName") : "Lab Technician";
        return ResponseEntity.ok(faultReportService.convertToMaintenance(id, technician));
    }
}

