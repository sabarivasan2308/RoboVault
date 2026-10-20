package com.robovault.projects.service;

import com.robovault.activity.service.ActivityLogService;
import com.robovault.assets.model.Asset;
import com.robovault.assets.model.AssetStatus;
import com.robovault.assets.repository.AssetRepository;
import com.robovault.common.exception.BadRequestException;
import com.robovault.common.exception.ResourceNotFoundException;
import com.robovault.common.response.PaginatedResponse;
import com.robovault.projects.model.Project;
import com.robovault.projects.model.ProjectAllocation;
import com.robovault.projects.model.ProjectStatus;
import com.robovault.projects.repository.ProjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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

    public PaginatedResponse<Project> getProjectsPaginated(int page, int size, ProjectStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Project> pageResult = (status != null)
                ? projectRepository.findByStatus(status, pageable)
                : projectRepository.findAll(pageable);

        return new PaginatedResponse<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
    }

    public Project getProjectById(String id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));
    }

    public Project createProject(Project project, String actorEmail) {
        String cleanCode = project.getCode().trim().toUpperCase();
        if (projectRepository.existsByCode(cleanCode)) {
            throw new BadRequestException("Project code '" + cleanCode + "' already exists");
        }

        project.setCode(cleanCode);
        project.setName(project.getName().trim());
        if (project.getStatus() == null) project.setStatus(ProjectStatus.ACTIVE);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());

        Project saved = projectRepository.save(project);
        activityLogService.log(actorEmail, "PROJECT_CREATED", "PROJECT", saved.getCode(),
                "Created project: " + saved.getName() + " (" + saved.getCode() + ")");
        return saved;
    }

    public Project updateProject(String id, Project updated, String actorEmail) {
        Project project = getProjectById(id);

        if (updated.getName() != null) project.setName(updated.getName().trim());
        if (updated.getDescription() != null) project.setDescription(updated.getDescription());
        if (updated.getProjectType() != null) project.setProjectType(updated.getProjectType());
        if (updated.getFacultySupervisor() != null) project.setFacultySupervisor(updated.getFacultySupervisor());
        if (updated.getTeamMembers() != null) project.setTeamMembers(updated.getTeamMembers());
        if (updated.getStatus() != null) project.setStatus(updated.getStatus());
        if (updated.getStartDate() != null) project.setStartDate(updated.getStartDate());
        if (updated.getExpectedCompletionDate() != null) project.setExpectedCompletionDate(updated.getExpectedCompletionDate());
        if (updated.getProjectNotes() != null) project.setProjectNotes(updated.getProjectNotes());

        project.setUpdatedAt(LocalDateTime.now());
        Project saved = projectRepository.save(project);
        activityLogService.log(actorEmail, "PROJECT_UPDATED", "PROJECT", saved.getCode(),
                "Updated project details for " + saved.getName());
        return saved;
    }

    public synchronized Project allocateAsset(String projectId, String assetId, int quantity, String actorEmail) {
        Project project = getProjectById(projectId);
        Asset asset = assetRepository.findByAssetId(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + assetId));

        if (asset.getStatus() == AssetStatus.RETIRED || asset.getStatus() == AssetStatus.LOST) {
            throw new BadRequestException("Asset is " + asset.getStatus() + " and cannot be allocated to projects");
        }

        String allocationId = "ALC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        ProjectAllocation allocation = new ProjectAllocation(allocationId, asset.getAssetId(), asset.getName(), quantity, actorEmail);
        project.getAllocatedAssets().add(allocation);
        project.setUpdatedAt(LocalDateTime.now());

        // Update asset reference
        asset.setAllocatedProjectId(project.getId());
        asset.setAllocatedProjectName(project.getName());
        assetRepository.save(asset);

        Project saved = projectRepository.save(project);
        activityLogService.log(actorEmail, "ASSET_ALLOCATED", "PROJECT", project.getCode(),
                "Allocated " + quantity + "x " + asset.getName() + " to project " + project.getName());
        return saved;
    }

    public synchronized Project releaseAllocation(String projectId, String allocationId, String actorEmail) {
        Project project = getProjectById(projectId);
        ProjectAllocation found = project.getAllocatedAssets().stream()
                .filter(a -> a.getAllocationId().equalsIgnoreCase(allocationId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Allocation not found with ID: " + allocationId));

        project.getAllocatedAssets().remove(found);
        project.setUpdatedAt(LocalDateTime.now());

        // Clear asset allocation if no more allocations exist for this asset in the project
        boolean otherAllocExists = project.getAllocatedAssets().stream()
                .anyMatch(a -> a.getAssetId().equalsIgnoreCase(found.getAssetId()));
        if (!otherAllocExists) {
            assetRepository.findByAssetId(found.getAssetId()).ifPresent(asset -> {
                if (projectId.equals(asset.getAllocatedProjectId())) {
                    asset.setAllocatedProjectId(null);
                    asset.setAllocatedProjectName(null);
                    assetRepository.save(asset);
                }
            });
        }

        Project saved = projectRepository.save(project);
        activityLogService.log(actorEmail, "ASSET_RELEASED", "PROJECT", project.getCode(),
                "Released asset allocation " + found.getAssetId() + " from " + project.getName());
        return saved;
    }
}

