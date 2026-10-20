package com.robovault.model;

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
    private String name; // e.g. "Autonomous Delivery Robot"

    private String description;
    private String projectLead;
    private List<String> teamMembers = new ArrayList<>();
    private List<String> allocatedAssetIds = new ArrayList<>(); // e.g. ["RB-STM32-001", "RB-ESP32-014"]
    private String status = "ACTIVE"; // "ACTIVE", "COMPLETED", "ON_HOLD"
    private String startDate;
    private String targetCompletionDate;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public Project() {
    }

    public Project(String code, String name, String description, String projectLead) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.projectLead = projectLead;
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

    public String getProjectLead() {
        return projectLead;
    }

    public void setProjectLead(String projectLead) {
        this.projectLead = projectLead;
    }

    public List<String> getTeamMembers() {
        return teamMembers;
    }

    public void setTeamMembers(List<String> teamMembers) {
        this.teamMembers = teamMembers;
    }

    public List<String> getAllocatedAssetIds() {
        return allocatedAssetIds;
    }

    public void setAllocatedAssetIds(List<String> allocatedAssetIds) {
        this.allocatedAssetIds = allocatedAssetIds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getTargetCompletionDate() {
        return targetCompletionDate;
    }

    public void setTargetCompletionDate(String targetCompletionDate) {
        this.targetCompletionDate = targetCompletionDate;
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

