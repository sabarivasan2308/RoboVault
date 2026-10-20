package com.robovault.service;

import com.robovault.exception.ResourceNotFoundException;
import com.robovault.model.*;
import com.robovault.repository.AssetRepository;
import com.robovault.repository.FaultReportRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FaultReportService {

    private final FaultReportRepository faultReportRepository;
    private final AssetRepository assetRepository;
    private final MaintenanceService maintenanceService;
    private final ActivityLogService activityLogService;

    public FaultReportService(FaultReportRepository faultReportRepository,
                              AssetRepository assetRepository,
                              MaintenanceService maintenanceService,
                              ActivityLogService activityLogService) {
        this.faultReportRepository = faultReportRepository;
        this.assetRepository = assetRepository;
        this.maintenanceService = maintenanceService;
        this.activityLogService = activityLogService;
    }

    public List<FaultReport> getAllFaultReports() {
        return faultReportRepository.findAll();
    }

    public FaultReport getFaultReportById(String id) {
        return faultReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fault report not found with ID: " + id));
    }

    public FaultReport createFaultReport(FaultReport report) {
        Asset asset = assetRepository.findByAssetId(report.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + report.getAssetId()));

        report.setAssetName(asset.getName());
        report.setCreatedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());

        if (report.getSeverity() == FaultSeverity.HIGH || report.getSeverity() == FaultSeverity.CRITICAL) {
            asset.setStatus(AssetStatus.DAMAGED);
            assetRepository.save(asset);
        }

        FaultReport saved = faultReportRepository.save(report);
        activityLogService.log("FAULT_REPORTED", "FAULT", saved.getId(),
                "Fault reported on " + asset.getName() + ": " + report.getTitle() + " (" + report.getSeverity() + ")",
                report.getReportedBy());
        return saved;
    }

    public FaultReport updateFaultStatus(String id, String status) {
        FaultReport report = getFaultReportById(id);
        report.setStatus(status);
        report.setUpdatedAt(LocalDateTime.now());
        return faultReportRepository.save(report);
    }

    public MaintenanceRecord convertToMaintenance(String faultId, String technicianName) {
        FaultReport report = getFaultReportById(faultId);
        
        MaintenanceRecord record = new MaintenanceRecord();
        record.setAssetId(report.getAssetId());
        record.setAssetName(report.getAssetName());
        record.setFaultReportId(report.getId());
        record.setIssueDescription(report.getTitle() + " - " + report.getDescription());
        record.setTechnicianName(technicianName);
        record.setStatus(MaintenanceStatus.DIAGNOSIS);

        MaintenanceRecord saved = maintenanceService.createMaintenanceRecord(record);
        
        report.setStatus("IN_MAINTENANCE");
        report.setMaintenanceRecordId(saved.getId());
        faultReportRepository.save(report);

        return saved;
    }
}

