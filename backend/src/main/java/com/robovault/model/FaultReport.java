package com.robovault.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Document(collection = "fault_reports")
public class FaultReport {

    @Id
    private String id;

    @NotBlank(message = "Asset ID is required")
    private String assetId;

    private String assetName;

    @NotBlank(message = "Reported by name is required")
    private String reportedBy;

    private String reporterEmail;

    @NotBlank(message = "Issue title is required")
    private String title;

    private String description;
    private FaultSeverity severity = FaultSeverity.MEDIUM;
    private String status = "REPORTED"; // "REPORTED", "UNDER_REVIEW", "IN_MAINTENANCE", "RESOLVED"

    private String maintenanceRecordId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public FaultReport() {
    }

    public FaultReport(String assetId, String assetName, String reportedBy, String title, String description, FaultSeverity severity) {
        this.assetId = assetId;
        this.assetName = assetName;
        this.reportedBy = reportedBy;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.status = "REPORTED";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public String getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(String reportedBy) {
        this.reportedBy = reportedBy;
    }

    public String getReporterEmail() {
        return reporterEmail;
    }

    public void setReporterEmail(String reporterEmail) {
        this.reporterEmail = reporterEmail;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public FaultSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(FaultSeverity severity) {
        this.severity = severity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMaintenanceRecordId() {
        return maintenanceRecordId;
    }

    public void setMaintenanceRecordId(String maintenanceRecordId) {
        this.maintenanceRecordId = maintenanceRecordId;
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

