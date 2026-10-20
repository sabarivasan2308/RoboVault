package com.robovault.service;

import com.robovault.dto.DashboardSummaryDto;
import com.robovault.model.Asset;
import com.robovault.model.AssetCategory;
import com.robovault.model.AssetStatus;
import com.robovault.model.CheckoutRecord;
import com.robovault.model.CheckoutStatus;
import com.robovault.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final AssetRepository assetRepository;
    private final CheckoutRecordRepository checkoutRecordRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final ProjectRepository projectRepository;
    private final FaultReportRepository faultReportRepository;
    private final ActivityLogService activityLogService;

    public DashboardService(AssetRepository assetRepository,
                            CheckoutRecordRepository checkoutRecordRepository,
                            MaintenanceRecordRepository maintenanceRecordRepository,
                            ProjectRepository projectRepository,
                            FaultReportRepository faultReportRepository,
                            ActivityLogService activityLogService) {
        this.assetRepository = assetRepository;
        this.checkoutRecordRepository = checkoutRecordRepository;
        this.maintenanceRecordRepository = maintenanceRecordRepository;
        this.projectRepository = projectRepository;
        this.faultReportRepository = faultReportRepository;
        this.activityLogService = activityLogService;
    }

    public DashboardSummaryDto getSummary() {
        DashboardSummaryDto dto = new DashboardSummaryDto();

        List<Asset> allAssets = assetRepository.findAll();
        dto.setTotalAssets(allAssets.size());

        long available = allAssets.stream().filter(a -> a.getStatus() == AssetStatus.AVAILABLE).count();
        long inUse = allAssets.stream().filter(a -> a.getStatus() == AssetStatus.IN_USE).count();
        long maintenance = allAssets.stream().filter(a -> a.getStatus() == AssetStatus.MAINTENANCE).count();
        long damaged = allAssets.stream().filter(a -> a.getStatus() == AssetStatus.DAMAGED).count();

        dto.setAvailableAssets(available);
        dto.setInUseAssets(inUse);
        dto.setMaintenanceAssets(maintenance);
        dto.setDamagedAssets(damaged);

        // Check for overdue checkouts
        List<CheckoutRecord> checkouts = checkoutRecordRepository.findAll();
        long overdue = checkouts.stream()
                .filter(c -> c.getStatus() == CheckoutStatus.ISSUED && c.getExpectedReturnDate() != null)
                .filter(c -> {
                    try {
                        LocalDate expected = LocalDate.parse(c.getExpectedReturnDate(), DateTimeFormatter.ISO_LOCAL_DATE);
                        return expected.isBefore(LocalDate.now());
                    } catch (Exception e) {
                        return false;
                    }
                }).count();
        dto.setOverdueAssets(overdue);

        dto.setActiveProjects(projectRepository.count());
        dto.setOpenFaultReports(faultReportRepository.findAll().stream()
                .filter(f -> !"RESOLVED".equalsIgnoreCase(f.getStatus())).count());

        // Category distribution
        Map<String, Long> catDist = new HashMap<>();
        for (AssetCategory cat : AssetCategory.values()) {
            long count = allAssets.stream().filter(a -> a.getCategory() == cat).count();
            if (count > 0) {
                catDist.put(cat.getDisplayName(), count);
            }
        }
        dto.setCategoryDistribution(catDist);

        // Status distribution
        Map<String, Long> statusDist = new HashMap<>();
        for (AssetStatus st : AssetStatus.values()) {
            long count = allAssets.stream().filter(a -> a.getStatus() == st).count();
            statusDist.put(st.name(), count);
        }
        dto.setStatusDistribution(statusDist);

        dto.setRecentActivity(activityLogService.getRecentActivities());

        return dto;
    }
}

