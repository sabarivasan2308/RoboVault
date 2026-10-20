package com.robovault.assets.dto;

import com.robovault.assets.model.AssetCategory;
import com.robovault.assets.model.AssetStatus;
import com.robovault.assets.model.PhysicalCondition;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AssetCreateDto {

    @NotBlank(message = "Asset ID is required")
    private String assetId;

    @NotBlank(message = "Asset name is required")
    private String name;

    @NotNull(message = "Category is required")
    private AssetCategory category;

    private String brand;
    private String model;
    private String serialNumber;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity = 1;

    @NotBlank(message = "Location is required")
    private String location;

    private AssetStatus status = AssetStatus.AVAILABLE;
    private PhysicalCondition condition = PhysicalCondition.GOOD;
    private String purchaseDate;
    private String description;

    public AssetCreateDto() {
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

    public PhysicalCondition getCondition() {
        return condition;
    }

    public void setCondition(PhysicalCondition condition) {
        this.condition = condition;
    }

    public String getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(String purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
