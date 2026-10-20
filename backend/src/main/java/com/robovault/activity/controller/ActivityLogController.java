package com.robovault.activity.controller;

import com.robovault.activity.model.ActivityLog;
import com.robovault.activity.service.ActivityLogService;
import com.robovault.common.response.ApiResponse;
import com.robovault.common.response.PaginatedResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activity-logs")
@PreAuthorize("hasAnyRole('ADMIN', 'LAB_ASSISTANT')")
public class ActivityLogController {

    private final ActivityLogService service;

    public ActivityLogController(ActivityLogService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<ActivityLog>>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String entityType) {
        return ResponseEntity.ok(ApiResponse.success(service.getLogsPaginated(page, size, entityType)));
    }
}

