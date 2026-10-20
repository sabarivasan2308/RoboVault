package com.robovault.faults.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Document(collection = "fault_reports")
public class FaultReport {

    @Id
    private String id;

    @Indexed
    private String faultId; // e.g. "FLT-2026-001"

    @NotBlank(message = "Asset ID is required")
    @Indexed
    private String assetId;

    private String assetName;

    @NotBlank(message = "Reporter is required")
    private String reporter;

    private String reporterEmail;

    @NotBlank(message = "Fault title is required")
    private String faultTitle;

    private String description;

    @Indexed
    private FaultSeverity severity = FaultSeverity.MEDIUM;

    @Indexed
    private FaultStatus status = FaultStatus.OPEN;

    private String location;
    private LocalDateTime reportedDate;
    private String assignedTechnician;
    private String diagnosis;
    private String resolution;
    private String linkedMaintenanceId;
    private LocalDateTime resolvedDate;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public FaultReport() {
        this.reportedDate = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFaultId() {
        return faultId;
    }

    public void setFaultId(String faultId) {
        this.faultId = faultId;
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

    public String getReporter() {
        return reporter;
    }

    public void setReporter(String reporter) {
        this.reporter = reporter;
    }

    public String getReporterEmail() {
        return reporterEmail;
    }

    public void setReporterEmail(String reporterEmail) {
        this.reporterEmail = reporterEmail;
    }

    public String getFaultTitle() {
        return faultTitle;
    }

    public void setFaultTitle(String faultTitle) {
        this.faultTitle = faultTitle;
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

    public FaultStatus getStatus() {
        return status;
    }

    public void setStatus(FaultStatus status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getReportedDate() {
        return reportedDate;
    }

    public void setReportedDate(LocalDateTime reportedDate) {
        this.reportedDate = reportedDate;
    }

    public String getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(String assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public String getLinkedMaintenanceId() {
        return linkedMaintenanceId;
    }

    public void setLinkedMaintenanceId(String linkedMaintenanceId) {
        this.linkedMaintenanceId = linkedMaintenanceId;
    }

    public LocalDateTime getResolvedDate() {
        return resolvedDate;
    }

    public void setResolvedDate(LocalDateTime resolvedDate) {
        this.resolvedDate = resolvedDate;
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

