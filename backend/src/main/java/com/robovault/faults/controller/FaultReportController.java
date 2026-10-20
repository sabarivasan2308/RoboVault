package com.robovault.faults.controller;

import com.robovault.common.response.ApiResponse;
import com.robovault.common.response.PaginatedResponse;
import com.robovault.faults.model.FaultReport;
import com.robovault.faults.model.FaultSeverity;
import com.robovault.faults.model.FaultStatus;
import com.robovault.faults.service.FaultReportService;
import com.robovault.maintenance.model.MaintenanceRecord;
import com.robovault.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faults")
public class FaultReportController {

    private final FaultReportService faultService;

    public FaultReportController(FaultReportService faultService) {
        this.faultService = faultService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<FaultReport>>> getFaults(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) FaultStatus status,
            @RequestParam(required = false) FaultSeverity severity) {
        return ResponseEntity.ok(ApiResponse.success(faultService.getFaultsPaginated(page, size, status, severity)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<FaultReport>>> getAllFaults() {
        return ResponseEntity.ok(ApiResponse.success(faultService.getAllFaults()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FaultReport>> getFaultById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(faultService.getFaultById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FaultReport>> reportFault(
            @Valid @RequestBody FaultReport report,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Student";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Fault reported", faultService.createFaultReport(report, actor)));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<FaultReport>> assignTechnician(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String technician = body.getOrDefault("technician", "Staff");
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Staff";
        return ResponseEntity.ok(ApiResponse.success("Technician assigned", faultService.assignTechnician(id, technician, actor)));
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<FaultReport>> resolveFault(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String diagnosis = body.getOrDefault("diagnosis", "Diagnosed and tested");
        String resolution = body.getOrDefault("resolution", "Fixed components");
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Staff";
        return ResponseEntity.ok(ApiResponse.success("Fault resolved", faultService.resolveFault(id, diagnosis, resolution, actor)));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<FaultReport>> closeFault(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Staff";
        return ResponseEntity.ok(ApiResponse.success("Fault closed", faultService.closeFault(id, actor)));
    }

    @PostMapping("/{id}/convert-to-maintenance")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<MaintenanceRecord>> convertToMaintenance(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String technician = (body != null && body.containsKey("technician")) ? body.get("technician") : "Lab Assistant";
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Staff";
        return ResponseEntity.ok(ApiResponse.success("Converted to maintenance case", faultService.convertToMaintenance(id, technician, actor)));
    }
}

