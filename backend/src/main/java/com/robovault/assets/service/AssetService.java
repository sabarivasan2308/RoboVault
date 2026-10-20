package com.robovault.assets.service;

import com.robovault.activity.service.ActivityLogService;
import com.robovault.assets.dto.AssetCreateDto;
import com.robovault.assets.dto.AssetUpdateDto;
import com.robovault.assets.model.Asset;
import com.robovault.assets.model.AssetCategory;
import com.robovault.assets.model.AssetStatus;
import com.robovault.assets.model.PhysicalCondition;
import com.robovault.assets.repository.AssetRepository;
import com.robovault.common.exception.BadRequestException;
import com.robovault.common.exception.ResourceNotFoundException;
import com.robovault.common.response.PaginatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    public PaginatedResponse<Asset> getAssetsPaginated(int page, int size, String query, AssetCategory category, AssetStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Asset> pageResult;

        if (query != null && !query.trim().isEmpty()) {
            pageResult = assetRepository.searchByGeneralQueryPaged(query.trim(), pageable);
        } else if (category != null) {
            pageResult = assetRepository.findByCategory(category, pageable);
        } else if (status != null) {
            pageResult = assetRepository.findByStatus(status, pageable);
        } else {
            pageResult = assetRepository.findAll(pageable);
        }

        return new PaginatedResponse<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
    }

    public Asset getAssetById(String id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));
    }

    public Asset getAssetByAssetId(String assetId) {
        return assetRepository.findByAssetId(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with Asset ID: " + assetId));
    }

    public Asset createAsset(AssetCreateDto dto, String userEmail) {
        String cleanAssetId = dto.getAssetId().trim().toUpperCase();
        if (assetRepository.existsByAssetId(cleanAssetId)) {
            throw new BadRequestException("Asset ID '" + cleanAssetId + "' already exists");
        }

        Asset asset = new Asset();
        asset.setAssetId(cleanAssetId);
        asset.setName(dto.getName().trim());
        asset.setCategory(dto.getCategory());
        asset.setBrand(dto.getBrand());
        asset.setModel(dto.getModel());
        asset.setSerialNumber(dto.getSerialNumber());
        asset.setQuantity(dto.getQuantity());
        asset.setAvailableQuantity(dto.getStatus() == AssetStatus.AVAILABLE ? dto.getQuantity() : 0);
        asset.setLocation(dto.getLocation());
        asset.setStatus(dto.getStatus() != null ? dto.getStatus() : AssetStatus.AVAILABLE);
        asset.setCondition(dto.getCondition() != null ? dto.getCondition() : PhysicalCondition.GOOD);
        asset.setPurchaseDate(dto.getPurchaseDate());
        asset.setDescription(dto.getDescription());
        asset.setCreatedBy(userEmail);
        asset.setUpdatedBy(userEmail);
        asset.setCreatedAt(LocalDateTime.now());
        asset.setUpdatedAt(LocalDateTime.now());

        Asset saved = assetRepository.save(asset);
        activityLogService.log(userEmail, "ASSET_CREATED", "ASSET", saved.getAssetId(),
                "Registered new asset: " + saved.getName() + " (" + saved.getAssetId() + ")");
        return saved;
    }

    public Asset updateAsset(String id, AssetUpdateDto dto, String userEmail) {
        Asset asset = getAssetById(id);

        if (dto.getName() != null) asset.setName(dto.getName().trim());
        if (dto.getCategory() != null) asset.setCategory(dto.getCategory());
        if (dto.getBrand() != null) asset.setBrand(dto.getBrand());
        if (dto.getModel() != null) asset.setModel(dto.getModel());
        if (dto.getSerialNumber() != null) asset.setSerialNumber(dto.getSerialNumber());
        if (dto.getLocation() != null) asset.setLocation(dto.getLocation());
        if (dto.getStatus() != null) asset.setStatus(dto.getStatus());
        if (dto.getCondition() != null) asset.setCondition(dto.getCondition());
        if (dto.getDescription() != null) asset.setDescription(dto.getDescription());
        if (dto.getPurchaseDate() != null) asset.setPurchaseDate(dto.getPurchaseDate());

        if (dto.getQuantity() != null) {
            if (dto.getQuantity() < 0) throw new BadRequestException("Quantity cannot be negative");
            asset.setQuantity(dto.getQuantity());
        }
        if (dto.getAvailableQuantity() != null) {
            if (dto.getAvailableQuantity() < 0) throw new BadRequestException("Available quantity cannot be negative");
            if (dto.getAvailableQuantity() > asset.getQuantity()) {
                throw new BadRequestException("Available quantity cannot exceed total quantity");
            }
            asset.setAvailableQuantity(dto.getAvailableQuantity());
        }

        asset.setUpdatedBy(userEmail);
        asset.setUpdatedAt(LocalDateTime.now());

        Asset saved = assetRepository.save(asset);
        activityLogService.log(userEmail, "ASSET_UPDATED", "ASSET", saved.getAssetId(),
                "Updated asset: " + saved.getName() + " (" + saved.getAssetId() + ")");
        return saved;
    }

    public void deleteAsset(String id, String userEmail) {
        Asset asset = getAssetById(id);

        if (asset.getStatus() == AssetStatus.IN_USE || asset.getStatus() == AssetStatus.RESERVED || asset.getStatus() == AssetStatus.MAINTENANCE) {
            throw new BadRequestException("Cannot delete asset while it is " + asset.getStatus() + ". Must be AVAILABLE or RETIRED.");
        }

        assetRepository.delete(asset);
        activityLogService.log(userEmail, "ASSET_DELETED", "ASSET", asset.getAssetId(),
                "Deleted asset: " + asset.getName() + " (" + asset.getAssetId() + ")");
    }

    public List<Asset> searchAssets(String query, AssetCategory category, AssetStatus status) {
        List<Asset> list;
        if (query != null && !query.trim().isEmpty()) {
            list = assetRepository.searchByGeneralQuery(query.trim());
        } else {
            list = assetRepository.findAll();
        }

        return list.stream()
                .filter(a -> category == null || a.getCategory() == category)
                .filter(a -> status == null || a.getStatus() == status)
                .collect(Collectors.toList());
    }

    public void updateStock(String assetId, int deltaQuantity, int deltaAvailable) {
        Asset asset = getAssetByAssetId(assetId);
        int newQty = asset.getQuantity() + deltaQuantity;
        int newAvail = asset.getAvailableQuantity() + deltaAvailable;

        if (newQty < 0 || newAvail < 0) {
            throw new BadRequestException("Stock underflow for asset: " + assetId);
        }
        if (newAvail > newQty) {
            newAvail = newQty;
        }

        asset.setQuantity(newQty);
        asset.setAvailableQuantity(newAvail);
        if (newAvail == 0 && newQty > 0) {
            asset.setStatus(AssetStatus.IN_USE);
        } else if (newAvail > 0 && asset.getStatus() == AssetStatus.IN_USE) {
            asset.setStatus(AssetStatus.AVAILABLE);
        }
        asset.setUpdatedAt(LocalDateTime.now());
        assetRepository.save(asset);
    }
}

