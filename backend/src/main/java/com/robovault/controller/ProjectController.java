package com.robovault.controller;

import com.robovault.model.Project;
import com.robovault.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable String id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@Valid @RequestBody Project project) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable String id, @RequestBody Project project) {
        return ResponseEntity.ok(projectService.updateProject(id, project));
    }

    @PostMapping("/{id}/allocate/{assetId}")
    public ResponseEntity<Project> allocateAsset(@PathVariable String id, @PathVariable String assetId) {
        return ResponseEntity.ok(projectService.allocateAsset(id, assetId));
    }

    @DeleteMapping("/{id}/allocate/{assetId}")
    public ResponseEntity<Project> deallocateAsset(@PathVariable String id, @PathVariable String assetId) {
        return ResponseEntity.ok(projectService.deallocateAsset(id, assetId));
    }
}

