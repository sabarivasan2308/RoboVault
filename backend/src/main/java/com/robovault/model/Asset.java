package com.robovault.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Document(collection = "assets")
public class Asset {

    @Id
    private String id;

    @NotBlank(message = "Asset ID is required")
    @Indexed(unique = true)
    private String assetId; // e.g. "RB-ESP32-014"

    @NotBlank(message = "Asset name is required")
    private String name;

    @NotNull(message = "Category is required")
    private AssetCategory category;

    private String brand;
    private String model;

    @Indexed
    private String serialNumber;

    private int quantity = 1;
    private String location; // e.g. "Robotics Lab - Rack B2"

    @NotNull(message = "Status is required")
    private AssetStatus status = AssetStatus.AVAILABLE;

    private String purchaseDate;
    private String condition = "GOOD"; // "NEW", "GOOD", "FAIR", "DAMAGED"
    private String description;

    private String allocatedProjectId;
    private String allocatedProjectName;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public Asset() {
    }

    public Asset(String assetId, String name, AssetCategory category, String brand, String model,
                 String serialNumber, int quantity, String location, AssetStatus status,
                 String condition, String description) {
        this.assetId = assetId;
        this.name = name;
        this.category = category;
        this.brand = brand;
        this.model = model;
        this.serialNumber = serialNumber;
        this.quantity = quantity;
        this.location = location;
        this.status = status;
        this.condition = condition;
        this.description = description;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AssetCategory getCategory() {
        return category;
    }

    public void setCategory(AssetCategory category) {
        this.category = category;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public AssetStatus getStatus() {
        return status;
    }

    public void setStatus(AssetStatus status) {
        this.status = status;
    }

    public String getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(String purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAllocatedProjectId() {
        return allocatedProjectId;
    }

    public void setAllocatedProjectId(String allocatedProjectId) {
        this.allocatedProjectId = allocatedProjectId;
    }

    public String getAllocatedProjectName() {
        return allocatedProjectName;
    }

    public void setAllocatedProjectName(String allocatedProjectName) {
        this.allocatedProjectName = allocatedProjectName;
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

