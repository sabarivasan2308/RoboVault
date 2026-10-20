package com.robovault.faults.service;

import com.robovault.activity.service.ActivityLogService;
import com.robovault.assets.model.Asset;
import com.robovault.assets.model.AssetStatus;
import com.robovault.assets.model.PhysicalCondition;
import com.robovault.assets.repository.AssetRepository;
import com.robovault.common.exception.BadRequestException;
import com.robovault.common.exception.ResourceNotFoundException;
import com.robovault.common.response.PaginatedResponse;
import com.robovault.faults.model.FaultReport;
import com.robovault.faults.model.FaultSeverity;
import com.robovault.faults.model.FaultStatus;
import com.robovault.faults.repository.FaultReportRepository;
import com.robovault.maintenance.model.MaintenancePriority;
import com.robovault.maintenance.model.MaintenanceRecord;
import com.robovault.maintenance.service.MaintenanceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class FaultReportService {

    private final FaultReportRepository faultRepository;
    private final AssetRepository assetRepository;
    private final MaintenanceService maintenanceService;
    private final ActivityLogService activityLogService;

    public FaultReportService(FaultReportRepository faultRepository,
                              AssetRepository assetRepository,
                              MaintenanceService maintenanceService,
                              ActivityLogService activityLogService) {
        this.faultRepository = faultRepository;
        this.assetRepository = assetRepository;
        this.maintenanceService = maintenanceService;
        this.activityLogService = activityLogService;
    }

    public List<FaultReport> getAllFaults() {
        return faultRepository.findAll();
    }

    public PaginatedResponse<FaultReport> getFaultsPaginated(int page, int size, FaultStatus status, FaultSeverity severity) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("reportedDate").descending());
        Page<FaultReport> pageResult;

        if (status != null) {
            pageResult = faultRepository.findByStatus(status, pageable);
        } else if (severity != null) {
            pageResult = faultRepository.findBySeverity(severity, pageable);
        } else {
            pageResult = faultRepository.findAll(pageable);
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

    public FaultReport getFaultById(String id) {
        return faultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fault report not found with ID: " + id));
    }

    public synchronized FaultReport createFaultReport(FaultReport report, String actorEmail) {
        Asset asset = assetRepository.findByAssetId(report.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + report.getAssetId()));

        report.setFaultId("FLT-" + System.currentTimeMillis() % 1000000);
        report.setAssetName(asset.getName());
        report.setStatus(FaultStatus.OPEN);
        report.setReportedDate(LocalDateTime.now());
        report.setReporterEmail(actorEmail);
        report.setCreatedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());

        if (report.getSeverity() == FaultSeverity.HIGH || report.getSeverity() == FaultSeverity.CRITICAL) {
            asset.setStatus(AssetStatus.DAMAGED);
            asset.setCondition(PhysicalCondition.DAMAGED);
            assetRepository.save(asset);
        }

        FaultReport saved = faultRepository.save(report);
        activityLogService.log(actorEmail, "FAULT_REPORTED", "FAULT", saved.getFaultId(),
                "Reported " + saved.getSeverity() + " fault on " + asset.getName() + ": " + saved.getFaultTitle());
        return saved;
    }

    public synchronized FaultReport assignTechnician(String id, String technicianName, String actorEmail) {
        FaultReport report = getFaultById(id);
        report.setAssignedTechnician(technicianName);
        report.setStatus(FaultStatus.ASSIGNED);
        report.setUpdatedAt(LocalDateTime.now());

        FaultReport saved = faultRepository.save(report);
        activityLogService.log(actorEmail, "FAULT_ASSIGNED", "FAULT", saved.getFaultId(),
                "Assigned technician " + technicianName + " to fault " + saved.getFaultId());
        return saved;
    }

    public synchronized FaultReport resolveFault(String id, String diagnosis, String resolution, String actorEmail) {
        FaultReport report = getFaultById(id);
        report.setDiagnosis(diagnosis);
        report.setResolution(resolution);
        report.setStatus(FaultStatus.RESOLVED);
        report.setResolvedDate(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());

        FaultReport saved = faultRepository.save(report);
        activityLogService.log(actorEmail, "FAULT_RESOLVED", "FAULT", saved.getFaultId(),
                "Resolved fault " + saved.getFaultId() + " on " + saved.getAssetName());
        return saved;
    }

    public synchronized FaultReport closeFault(String id, String actorEmail) {
        FaultReport report = getFaultById(id);
        if (report.getStatus() != FaultStatus.RESOLVED) {
            throw new BadRequestException("Fault report must be marked RESOLVED before it can be closed");
        }
        report.setStatus(FaultStatus.CLOSED);
        report.setUpdatedAt(LocalDateTime.now());

        FaultReport saved = faultRepository.save(report);
        activityLogService.log(actorEmail, "FAULT_CLOSED", "FAULT", saved.getFaultId(),
                "Closed fault ticket " + saved.getFaultId());
        return saved;
    }

    public synchronized MaintenanceRecord convertToMaintenance(String faultId, String technicianName, String actorEmail) {
        FaultReport report = getFaultById(faultId);

        MaintenanceRecord mRec = new MaintenanceRecord();
        mRec.setAssetId(report.getAssetId());
        mRec.setProblemDescription(report.getFaultTitle() + " - " + report.getDescription());
        mRec.setAssignedTechnician(technicianName != null ? technicianName : "Unassigned");
        mRec.setPriority(mapSeverityToPriority(report.getSeverity()));

        MaintenanceRecord created = maintenanceService.createRecord(mRec, actorEmail);

        report.setStatus(FaultStatus.IN_PROGRESS);
        report.setLinkedMaintenanceId(created.getMaintenanceId());
        report.setUpdatedAt(LocalDateTime.now());
        faultRepository.save(report);

        return created;
    }

    private MaintenancePriority mapSeverityToPriority(FaultSeverity severity) {
        switch (severity) {
            case CRITICAL: return MaintenancePriority.CRITICAL;
            case HIGH: return MaintenancePriority.HIGH;
            case LOW: return MaintenancePriority.LOW;
            default: return MaintenancePriority.MEDIUM;
        }
    }
}
