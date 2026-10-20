package com.robovault.service;

import com.robovault.exception.BadRequestException;
import com.robovault.exception.ResourceNotFoundException;
import com.robovault.model.Asset;
import com.robovault.model.AssetCategory;
import com.robovault.model.AssetStatus;
import com.robovault.repository.AssetRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final ActivityLogService activityLogService;

    public AssetService(AssetRepository assetRepository, ActivityLogService activityLogService) {
        this.assetRepository = assetRepository;
        this.activityLogService = activityLogService;
    }

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public Asset getAssetById(String id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));
    }

    public Asset getAssetByAssetId(String assetId) {
        return assetRepository.findByAssetId(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with Asset ID: " + assetId));
    }

    public Asset createAsset(Asset asset) {
        if (asset.getAssetId() == null || asset.getAssetId().trim().isEmpty()) {
            throw new BadRequestException("Asset ID cannot be empty");
        }
        if (assetRepository.findByAssetId(asset.getAssetId()).isPresent()) {
            throw new BadRequestException("Asset with ID '" + asset.getAssetId() + "' already exists");
        }

        if (asset.getStatus() == null) {
            asset.setStatus(AssetStatus.AVAILABLE);
        }
        asset.setCreatedAt(LocalDateTime.now());
        asset.setUpdatedAt(LocalDateTime.now());

        Asset saved = assetRepository.save(asset);
        activityLogService.log("ASSET_CREATED", "ASSET", saved.getAssetId(),
                "Asset registered: " + saved.getName() + " (" + saved.getAssetId() + ")", "Admin");
        return saved;
    }

    public Asset updateAsset(String id, Asset updatedData) {
        Asset existing = getAssetById(id);

        existing.setName(updatedData.getName());
        existing.setCategory(updatedData.getCategory());
        existing.setBrand(updatedData.getBrand());
        existing.setModel(updatedData.getModel());
        existing.setSerialNumber(updatedData.getSerialNumber());
        existing.setQuantity(updatedData.getQuantity());
        existing.setLocation(updatedData.getLocation());
        existing.setStatus(updatedData.getStatus());
        existing.setCondition(updatedData.getCondition());
        existing.setDescription(updatedData.getDescription());
        existing.setPurchaseDate(updatedData.getPurchaseDate());
        existing.setAllocatedProjectId(updatedData.getAllocatedProjectId());
        existing.setAllocatedProjectName(updatedData.getAllocatedProjectName());
        existing.setUpdatedAt(LocalDateTime.now());

        Asset saved = assetRepository.save(existing);
        activityLogService.log("ASSET_UPDATED", "ASSET", saved.getAssetId(),
                "Asset details updated: " + saved.getName(), "Admin");
        return saved;
    }

    public void deleteAsset(String id) {
        Asset asset = getAssetById(id);
        assetRepository.delete(asset);
        activityLogService.log("ASSET_DELETED", "ASSET", asset.getAssetId(),
                "Asset removed: " + asset.getName() + " (" + asset.getAssetId() + ")", "Admin");
    }

    public List<Asset> searchAssets(String query, AssetCategory category, AssetStatus status) {
        List<Asset> assets;
        if (query != null && !query.trim().isEmpty()) {
            assets = assetRepository.searchByGeneralQuery(query.trim());
        } else {
            assets = assetRepository.findAll();
        }

        return assets.stream()
                .filter(a -> category == null || a.getCategory() == category)
                .filter(a -> status == null || a.getStatus() == status)
                .collect(Collectors.toList());
    }

    public Asset updateStatus(String assetId, AssetStatus newStatus) {
        Asset asset = getAssetByAssetId(assetId);
        asset.setStatus(newStatus);
        asset.setUpdatedAt(LocalDateTime.now());
        return assetRepository.save(asset);
    }
}

