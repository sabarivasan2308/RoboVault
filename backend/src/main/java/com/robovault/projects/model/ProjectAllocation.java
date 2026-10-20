package com.robovault.projects.model;

import java.time.LocalDateTime;

public class ProjectAllocation {
    private String allocationId;
    private String assetId;
    private String assetName;
    private int quantity = 1;
    private LocalDateTime allocatedDate;
    private String allocatedBy;

    public ProjectAllocation() {
        this.allocatedDate = LocalDateTime.now();
    }

    public ProjectAllocation(String allocationId, String assetId, String assetName, int quantity, String allocatedBy) {
        this.allocationId = allocationId;
        this.assetId = assetId;
        this.assetName = assetName;
        this.quantity = quantity;
        this.allocatedBy = allocatedBy;
        this.allocatedDate = LocalDateTime.now();
    }

    public String getAllocationId() {
        return allocationId;
    }

    public void setAllocationId(String allocationId) {
        this.allocationId = allocationId;
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

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public LocalDateTime getAllocatedDate() {
        return allocatedDate;
    }

    public void setAllocatedDate(LocalDateTime allocatedDate) {
        this.allocatedDate = allocatedDate;
    }

    public String getAllocatedBy() {
        return allocatedBy;
    }

    public void setAllocatedBy(String allocatedBy) {
        this.allocatedBy = allocatedBy;
    }
}
