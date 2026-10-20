package com.robovault.service;

import com.robovault.dto.MaintenanceUpdateDto;
import com.robovault.exception.ResourceNotFoundException;
import com.robovault.model.Asset;
import com.robovault.model.AssetStatus;
import com.robovault.model.MaintenanceRecord;
import com.robovault.model.MaintenanceStatus;
import com.robovault.repository.AssetRepository;
import com.robovault.repository.MaintenanceRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final AssetRepository assetRepository;
    private final ActivityLogService activityLogService;

    public MaintenanceService(MaintenanceRecordRepository maintenanceRecordRepository,
                              AssetRepository assetRepository,
                              ActivityLogService activityLogService) {
        this.maintenanceRecordRepository = maintenanceRecordRepository;
        this.assetRepository = assetRepository;
        this.activityLogService = activityLogService;
    }

    public List<MaintenanceRecord> getAllMaintenanceRecords() {
        return maintenanceRecordRepository.findAll();
    }

    public MaintenanceRecord getMaintenanceById(String id) {
        return maintenanceRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found with ID: " + id));
    }

    public MaintenanceRecord createMaintenanceRecord(MaintenanceRecord record) {
        Asset asset = assetRepository.findByAssetId(record.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + record.getAssetId()));

        record.setAssetMongoId(asset.getId());
        record.setAssetName(asset.getName());
        record.setStatus(MaintenanceStatus.REPORTED);
        record.setReportedDate(LocalDateTime.now());

        // Update asset status to MAINTENANCE
        asset.setStatus(AssetStatus.MAINTENANCE);
        assetRepository.save(asset);

        MaintenanceRecord saved = maintenanceRecordRepository.save(record);
        activityLogService.log("MAINTENANCE_CREATED", "MAINTENANCE", saved.getId(),
                "Maintenance logged for " + asset.getName() + " (" + asset.getAssetId() + ")", "Technician");
        return saved;
    }

    public MaintenanceRecord updateMaintenance(String id, MaintenanceUpdateDto dto) {
        MaintenanceRecord record = getMaintenanceById(id);

        if (dto.getStatus() != null) {
            record.setStatus(dto.getStatus());
        }
        if (dto.getDiagnosis() != null) {
            record.setDiagnosis(dto.getDiagnosis());
        }
        if (dto.getActionTaken() != null) {
            record.setActionTaken(dto.getActionTaken());
        }
        if (dto.getPartsReplaced() != null) {
            record.setPartsReplaced(dto.getPartsReplaced());
        }
        if (dto.getCost() != null) {
            record.setCost(dto.getCost());
        }
        if (dto.getTechnicianName() != null) {
            record.setTechnicianName(dto.getTechnicianName());
        }
        if (dto.getNotes() != null) {
            record.setNotes(dto.getNotes());
        }

        // If completed/closed, restore asset to AVAILABLE
        if (dto.getStatus() == MaintenanceStatus.RESOLVED || dto.getStatus() == MaintenanceStatus.CLOSED) {
            record.setCompletedDate(LocalDateTime.now());
            assetRepository.findByAssetId(record.getAssetId()).ifPresent(asset -> {
                asset.setStatus(AssetStatus.AVAILABLE);
                asset.setCondition("GOOD");
                assetRepository.save(asset);
            });
        }

        MaintenanceRecord saved = maintenanceRecordRepository.save(record);
        activityLogService.log("MAINTENANCE_UPDATED", "MAINTENANCE", saved.getId(),
                "Maintenance status changed to " + record.getStatus() + " for " + record.getAssetName(), "Technician");
        return saved;
    }
}

