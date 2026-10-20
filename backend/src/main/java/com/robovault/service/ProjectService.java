package com.robovault.service;

import com.robovault.exception.BadRequestException;
import com.robovault.exception.ResourceNotFoundException;
import com.robovault.model.Asset;
import com.robovault.model.AssetStatus;
import com.robovault.model.Project;
import com.robovault.repository.AssetRepository;
import com.robovault.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final AssetRepository assetRepository;
    private final ActivityLogService activityLogService;

    public ProjectService(ProjectRepository projectRepository,
                          AssetRepository assetRepository,
                          ActivityLogService activityLogService) {
        this.projectRepository = projectRepository;
        this.assetRepository = assetRepository;
        this.activityLogService = activityLogService;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(String id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));
    }

    public Project createProject(Project project) {
        if (project.getCode() == null || project.getCode().trim().isEmpty()) {
            throw new BadRequestException("Project code is required");
        }
        if (projectRepository.findByCode(project.getCode()).isPresent()) {
            throw new BadRequestException("Project code '" + project.getCode() + "' already exists");
        }
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());

        Project saved = projectRepository.save(project);
        activityLogService.log("PROJECT_CREATED", "PROJECT", saved.getId(),
                "Project created: " + saved.getName() + " (" + saved.getCode() + ")", "Admin");
        return saved;
    }

    public Project updateProject(String id, Project updated) {
        Project existing = getProjectById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setProjectLead(updated.getProjectLead());
        existing.setTeamMembers(updated.getTeamMembers());
        existing.setStatus(updated.getStatus());
        existing.setStartDate(updated.getStartDate());
        existing.setTargetCompletionDate(updated.getTargetCompletionDate());
        existing.setUpdatedAt(LocalDateTime.now());

        Project saved = projectRepository.save(existing);
        activityLogService.log("PROJECT_UPDATED", "PROJECT", saved.getId(),
                "Project updated: " + saved.getName(), "Admin");
        return saved;
    }

    public Project allocateAsset(String projectId, String assetId) {
        Project project = getProjectById(projectId);
        Asset asset = assetRepository.findByAssetId(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + assetId));

        if (!project.getAllocatedAssetIds().contains(assetId)) {
            project.getAllocatedAssetIds().add(assetId);
            project.setUpdatedAt(LocalDateTime.now());
            projectRepository.save(project);
        }

        asset.setAllocatedProjectId(project.getId());
        asset.setAllocatedProjectName(project.getName());
        assetRepository.save(asset);

        activityLogService.log("ASSET_ALLOCATED", "PROJECT", project.getId(),
                "Asset " + asset.getName() + " allocated to project " + project.getName(), "Admin");
        return project;
    }

    public Project deallocateAsset(String projectId, String assetId) {
        Project project = getProjectById(projectId);
        project.getAllocatedAssetIds().remove(assetId);
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);

        assetRepository.findByAssetId(assetId).ifPresent(asset -> {
            if (projectId.equals(asset.getAllocatedProjectId())) {
                asset.setAllocatedProjectId(null);
                asset.setAllocatedProjectName(null);
                assetRepository.save(asset);
            }
        });

        activityLogService.log("ASSET_DEALLOCATED", "PROJECT", project.getId(),
                "Asset " + assetId + " deallocated from project " + project.getName(), "Admin");
        return project;
    }
}

