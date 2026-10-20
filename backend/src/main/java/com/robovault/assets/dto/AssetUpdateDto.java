package com.robovault.assets.dto;

import com.robovault.assets.model.AssetCategory;
import com.robovault.assets.model.AssetStatus;
import com.robovault.assets.model.PhysicalCondition;

public class AssetUpdateDto {
    private String name;
    private AssetCategory category;
    private String brand;
    private String model;
    private String serialNumber;
    private Integer quantity;
    private Integer availableQuantity;
    private String location;
    private AssetStatus status;
    private PhysicalCondition condition;
    private String purchaseDate;
    private String description;

    public AssetUpdateDto() {
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
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

