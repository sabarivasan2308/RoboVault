package com.robovault.projects.controller;

import com.robovault.common.response.ApiResponse;
import com.robovault.common.response.PaginatedResponse;
import com.robovault.projects.model.Project;
import com.robovault.projects.model.ProjectStatus;
import com.robovault.projects.service.ProjectService;
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
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<Project>>> getProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) ProjectStatus status) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectsPaginated(page, size, status)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Project>>> getAllProjects() {
        return ResponseEntity.ok(ApiResponse.success(projectService.getAllProjects()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> getProjectById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<Project>> createProject(
            @Valid @RequestBody Project project,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Faculty";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created", projectService.createProject(project, actor)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<Project>> updateProject(
            @PathVariable String id,
            @RequestBody Project project,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Faculty";
        return ResponseEntity.ok(ApiResponse.success("Project updated", projectService.updateProject(id, project, actor)));
    }

    @PostMapping("/{id}/allocations")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<Project>> allocateAsset(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String assetId = (String) body.get("assetId");
        int quantity = body.containsKey("quantity") ? Integer.parseInt(body.get("quantity").toString()) : 1;
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Staff";
        return ResponseEntity.ok(ApiResponse.success("Asset allocated", projectService.allocateAsset(id, assetId, quantity, actor)));
    }

    @PostMapping("/{id}/allocations/{allocationId}/release")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'LAB_ASSISTANT')")
    public ResponseEntity<ApiResponse<Project>> releaseAllocation(
            @PathVariable String id,
            @PathVariable String allocationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String actor = userPrincipal != null ? userPrincipal.getUsername() : "Staff";
        return ResponseEntity.ok(ApiResponse.success("Asset allocation released", projectService.releaseAllocation(id, allocationId, actor)));
    }
}
