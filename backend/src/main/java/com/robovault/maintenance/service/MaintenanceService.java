package com.robovault.maintenance.service;

import com.robovault.activity.service.ActivityLogService;
import com.robovault.assets.model.Asset;
import com.robovault.assets.model.AssetStatus;
import com.robovault.assets.model.PhysicalCondition;
import com.robovault.assets.repository.AssetRepository;
import com.robovault.common.exception.BadRequestException;
import com.robovault.common.exception.ResourceNotFoundException;
import com.robovault.common.response.PaginatedResponse;
import com.robovault.maintenance.model.MaintenancePriority;
import com.robovault.maintenance.model.MaintenanceRecord;
import com.robovault.maintenance.model.MaintenanceStatus;
import com.robovault.maintenance.repository.MaintenanceRecordRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRepository;
    private final AssetRepository assetRepository;
    private final ActivityLogService activityLogService;

    public MaintenanceService(MaintenanceRecordRepository maintenanceRepository,
                              AssetRepository assetRepository,
                              ActivityLogService activityLogService) {
        this.maintenanceRepository = maintenanceRepository;
        this.assetRepository = assetRepository;
        this.activityLogService = activityLogService;
    }

    public List<MaintenanceRecord> getAllRecords() {
        return maintenanceRepository.findAll();
    }

    public PaginatedResponse<MaintenanceRecord> getRecordsPaginated(int page, int size, MaintenanceStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("reportedDate").descending());
        Page<MaintenanceRecord> pageResult = (status != null)
                ? maintenanceRepository.findByStatus(status, pageable)
                : maintenanceRepository.findAll(pageable);

        return new PaginatedResponse<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
    }

    public MaintenanceRecord getRecordById(String id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found with ID: " + id));
    }

    public List<MaintenanceRecord> getRecordsByAssetId(String assetId) {
        return maintenanceRepository.findByAssetId(assetId);
    }

    public synchronized MaintenanceRecord createRecord(MaintenanceRecord record, String actorEmail) {
        Asset asset = assetRepository.findByAssetId(record.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + record.getAssetId()));

        record.setMaintenanceId("MNT-" + System.currentTimeMillis() % 1000000);
        record.setAssetName(asset.getName());
        record.setStatus(MaintenanceStatus.OPEN);
        record.setReportedDate(LocalDateTime.now());
        record.setCreatedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());

        // Update asset status to MAINTENANCE
        asset.setStatus(AssetStatus.MAINTENANCE);
        assetRepository.save(asset);

        MaintenanceRecord saved = maintenanceRepository.save(record);
        activityLogService.log(actorEmail, "MAINTENANCE_CREATED", "MAINTENANCE", saved.getMaintenanceId(),
                "Initiated maintenance for " + asset.getName() + " (" + asset.getAssetId() + "). Priority: " + saved.getPriority());
        return saved;
    }

    public synchronized MaintenanceRecord updateRecord(String id, MaintenanceRecord updated, String actorEmail) {
        MaintenanceRecord existing = getRecordById(id);

        if (updated.getProblemDescription() != null) existing.setProblemDescription(updated.getProblemDescription());
        if (updated.getDiagnosis() != null) existing.setDiagnosis(updated.getDiagnosis());
        if (updated.getAssignedTechnician() != null) existing.setAssignedTechnician(updated.getAssignedTechnician());
        if (updated.getPriority() != null) existing.setPriority(updated.getPriority());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        if (updated.getPartsReplaced() != null) existing.setPartsReplaced(updated.getPartsReplaced());
        if (updated.getRepairCost() >= 0) existing.setRepairCost(updated.getRepairCost());
        if (updated.getServiceNotes() != null) existing.setServiceNotes(updated.getServiceNotes());

        existing.setUpdatedAt(LocalDateTime.now());
        MaintenanceRecord saved = maintenanceRepository.save(existing);
        activityLogService.log(actorEmail, "MAINTENANCE_UPDATED", "MAINTENANCE", saved.getMaintenanceId(),
                "Updated maintenance record for " + saved.getAssetName() + " (Status: " + saved.getStatus() + ")");
        return saved;
    }

    public synchronized MaintenanceRecord resolveRecord(String id, Map<String, Object> body, String actorEmail) {
        MaintenanceRecord existing = getRecordById(id);
        existing.setStatus(MaintenanceStatus.RESOLVED);
        existing.setResolvedDate(LocalDateTime.now());

        if (body.containsKey("resolutionDetails")) existing.setResolutionDetails((String) body.get("resolutionDetails"));
        if (body.containsKey("partsReplaced")) existing.setPartsReplaced((String) body.get("partsReplaced"));
        if (body.containsKey("repairCost")) existing.setRepairCost(Double.parseDouble(body.get("repairCost").toString()));

        existing.setUpdatedAt(LocalDateTime.now());
        MaintenanceRecord saved = maintenanceRepository.save(existing);
        activityLogService.log(actorEmail, "MAINTENANCE_RESOLVED", "MAINTENANCE", saved.getMaintenanceId(),
                "Resolved maintenance case for " + saved.getAssetName());
        return saved;
    }

    public synchronized MaintenanceRecord closeRecord(String id, String actorEmail) {
        MaintenanceRecord existing = getRecordById(id);
        if (existing.getStatus() != MaintenanceStatus.RESOLVED) {
            throw new BadRequestException("Maintenance must be RESOLVED before closing and restoring equipment to active inventory");
        }

        existing.setStatus(MaintenanceStatus.CLOSED);
        existing.setUpdatedAt(LocalDateTime.now());

        // Restore asset to AVAILABLE after verification
        assetRepository.findByAssetId(existing.getAssetId()).ifPresent(asset -> {
            asset.setStatus(AssetStatus.AVAILABLE);
            asset.setCondition(PhysicalCondition.GOOD);
            assetRepository.save(asset);
        });

        MaintenanceRecord saved = maintenanceRepository.save(existing);
        activityLogService.log(actorEmail, "MAINTENANCE_CLOSED", "MAINTENANCE", saved.getMaintenanceId(),
                "Closed maintenance and restored " + saved.getAssetName() + " to active laboratory inventory");
        return saved;
    }
}
