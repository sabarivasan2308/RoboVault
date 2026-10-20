package com.robovault.checkouts.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class CheckoutSubmitDto {

    @NotBlank(message = "Asset ID is required")
    private String assetId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity = 1;

    private String projectId;
    private String projectName;
    private String intendedIssueDate;

    @NotBlank(message = "Due date is required")
    private String dueDate;

    private String notes;

    public CheckoutSubmitDto() {
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getIntendedIssueDate() {
        return intendedIssueDate;
    }

    public void setIntendedIssueDate(String intendedIssueDate) {
        this.intendedIssueDate = intendedIssueDate;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
