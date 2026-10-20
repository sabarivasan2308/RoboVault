package com.robovault.maintenance.controller;

import com.robovault.common.response.ApiResponse;
import com.robovault.common.response.PaginatedResponse;
import com.robovault.maintenance.model.MaintenanceRecord;
import com.robovault.maintenance.model.MaintenanceStatus;
import com.robovault.maintenance.service.MaintenanceService;
import com.robovault.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<MaintenanceRecord>>> getRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) MaintenanceStatus status) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getRecordsPaginated(page, size, status)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<MaintenanceRecord>>> getAllRecords() {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getAllRecords()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaintenanceRecord>> getRecordById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getRecordById(id)));
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<ApiResponse<List<MaintenanceRecord>>> getRecordsByAssetId(@PathVariable String assetId) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getRecordsByAssetId(assetId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<MaintenanceRecord>> createRecord(
            @RequestBody MaintenanceRecord record,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Staff";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Maintenance record created", maintenanceService.createRecord(record, actor)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<MaintenanceRecord>> updateRecord(
            @PathVariable String id,
            @RequestBody MaintenanceRecord record,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Staff";
        return ResponseEntity.ok(ApiResponse.success("Maintenance updated", maintenanceService.updateRecord(id, record, actor)));
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<MaintenanceRecord>> resolveRecord(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Staff";
        return ResponseEntity.ok(ApiResponse.success("Maintenance resolved", maintenanceService.resolveRecord(id, body, actor)));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<MaintenanceRecord>> closeRecord(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Staff";
        return ResponseEntity.ok(ApiResponse.success("Maintenance closed & asset restored", maintenanceService.closeRecord(id, actor)));
    }
}

