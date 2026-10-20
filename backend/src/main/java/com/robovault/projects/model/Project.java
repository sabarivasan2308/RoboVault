package com.robovault.projects.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "projects")
public class Project {

    @Id
    private String id;

    @NotBlank(message = "Project code is required")
    @Indexed(unique = true)
    private String code; // e.g. "PRJ-ADR-01"

    @NotBlank(message = "Project name is required")
    @Indexed
    private String name;

    private String description;
    private String projectType = "RESEARCH"; // RESEARCH, CAPSTONE, COURSEWORK
    private String facultySupervisor;
    private List<String> teamMembers = new ArrayList<>();

    private String startDate;
    private String expectedCompletionDate;
    private String actualCompletionDate;

    @Indexed
    private ProjectStatus status = ProjectStatus.ACTIVE;

    private String requiredResources;
    private List<ProjectAllocation> allocatedAssets = new ArrayList<>();
    private String projectNotes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public Project() {
    }

    public Project(String code, String name, String description, String facultySupervisor) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.facultySupervisor = facultySupervisor;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    public String getFacultySupervisor() {
        return facultySupervisor;
    }

    public void setFacultySupervisor(String facultySupervisor) {
        this.facultySupervisor = facultySupervisor;
    }

    public List<String> getTeamMembers() {
        return teamMembers;
    }

    public void setTeamMembers(List<String> teamMembers) {
        this.teamMembers = teamMembers;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getExpectedCompletionDate() {
        return expectedCompletionDate;
    }

    public void setExpectedCompletionDate(String expectedCompletionDate) {
        this.expectedCompletionDate = expectedCompletionDate;
    }

    public String getActualCompletionDate() {
        return actualCompletionDate;
    }

    public void setActualCompletionDate(String actualCompletionDate) {
        this.actualCompletionDate = actualCompletionDate;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public String getRequiredResources() {
        return requiredResources;
    }

    public void setRequiredResources(String requiredResources) {
        this.requiredResources = requiredResources;
    }

    public List<ProjectAllocation> getAllocatedAssets() {
        return allocatedAssets;
    }

    public void setAllocatedAssets(List<ProjectAllocation> allocatedAssets) {
        this.allocatedAssets = allocatedAssets;
    }

    public String getProjectNotes() {
        return projectNotes;
    }

    public void setProjectNotes(String projectNotes) {
        this.projectNotes = projectNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

