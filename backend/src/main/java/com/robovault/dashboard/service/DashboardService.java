package com.robovault.dashboard.service;

import com.robovault.activity.service.ActivityLogService;
import com.robovault.assets.model.Asset;
import com.robovault.assets.model.AssetCategory;
import com.robovault.assets.model.AssetStatus;
import com.robovault.assets.repository.AssetRepository;
import com.robovault.checkouts.model.CheckoutRecord;
import com.robovault.checkouts.model.CheckoutStatus;
import com.robovault.checkouts.repository.CheckoutRecordRepository;
import com.robovault.dashboard.dto.DashboardSummaryDto;
import com.robovault.faults.model.FaultStatus;
import com.robovault.faults.repository.FaultReportRepository;
import com.robovault.maintenance.model.MaintenanceStatus;
import com.robovault.maintenance.repository.MaintenanceRecordRepository;
import com.robovault.projects.model.ProjectStatus;
import com.robovault.projects.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final AssetRepository assetRepository;
    private final CheckoutRecordRepository checkoutRepository;
    private final MaintenanceRecordRepository maintenanceRepository;
    private final ProjectRepository projectRepository;
    private final FaultReportRepository faultRepository;
    private final ActivityLogService activityLogService;

    public DashboardService(AssetRepository assetRepository,
                            CheckoutRecordRepository checkoutRepository,
                            MaintenanceRecordRepository maintenanceRepository,
                            ProjectRepository projectRepository,
                            FaultReportRepository faultRepository,
                            ActivityLogService activityLogService) {
        this.assetRepository = assetRepository;
        this.checkoutRepository = checkoutRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.projectRepository = projectRepository;
        this.faultRepository = faultRepository;
        this.activityLogService = activityLogService;
    }

    public DashboardSummaryDto getSummary() {
        DashboardSummaryDto dto = new DashboardSummaryDto();

        List<Asset> allAssets = assetRepository.findAll();
        dto.setTotalAssets(allAssets.size());

        long totalUnits = allAssets.stream().mapToLong(Asset::getQuantity).sum();
        dto.setTotalInventoryUnits(totalUnits);

        long available = allAssets.stream().filter(a -> a.getStatus() == AssetStatus.AVAILABLE).count();
        long inUse = allAssets.stream().filter(a -> a.getStatus() == AssetStatus.IN_USE).count();
        long reserved = allAssets.stream().filter(a -> a.getStatus() == AssetStatus.RESERVED).count();
        long maintenance = allAssets.stream().filter(a -> a.getStatus() == AssetStatus.MAINTENANCE).count();
        long damaged = allAssets.stream().filter(a -> a.getStatus() == AssetStatus.DAMAGED).count();
        long lost = allAssets.stream().filter(a -> a.getStatus() == AssetStatus.LOST).count();
        long retired = allAssets.stream().filter(a -> a.getStatus() == AssetStatus.RETIRED).count();

        dto.setAvailableAssets(available);
        dto.setInUseAssets(inUse);
        dto.setReservedAssets(reserved);
        dto.setMaintenanceAssets(maintenance);
        dto.setDamagedAssets(damaged);
        dto.setLostAssets(lost);
        dto.setRetiredAssets(retired);

        // Utilization rate calculation: (inUse / (total - retired)) * 100
        long activeInventory = allAssets.size() - retired;
        double utilRate = (activeInventory > 0) ? Math.round(((double) inUse / activeInventory) * 1000.0) / 10.0 : 0.0;
        dto.setUtilizationRate(utilRate);

        // Checkouts breakdown
        List<CheckoutRecord> allCheckouts = checkoutRepository.findAll();
        dto.setPendingCheckouts(allCheckouts.stream().filter(c -> c.getStatus() == CheckoutStatus.PENDING).count());

        LocalDate today = LocalDate.now();
        List<CheckoutRecord> overdueList = allCheckouts.stream()
                .filter(c -> c.getStatus() == CheckoutStatus.ISSUED && c.getDueDate() != null)
                .filter(c -> {
                    try {
                        LocalDate due = LocalDate.parse(c.getDueDate(), DateTimeFormatter.ISO_LOCAL_DATE);
                        return due.isBefore(today);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());
        dto.setOverdueCheckouts(overdueList.size());
        dto.setOverdueList(overdueList);

        // Open Faults & Projects
        dto.setOpenFaultReports(faultRepository.countByStatusNot(FaultStatus.CLOSED));
        dto.setActiveProjects(projectRepository.countByStatus(ProjectStatus.ACTIVE));

        // Status distribution for Recharts
        List<Map<String, Object>> statusData = new ArrayList<>();
        for (AssetStatus st : AssetStatus.values()) {
            long count = allAssets.stream().filter(a -> a.getStatus() == st).count();
            if (count > 0) {
                Map<String, Object> map = new HashMap<>();
                map.put("name", st.name());
                map.put("value", count);
                statusData.add(map);
            }
        }
        dto.setStatusDistribution(statusData);

        // Category distribution for Recharts
        List<Map<String, Object>> catData = new ArrayList<>();
        for (AssetCategory cat : AssetCategory.values()) {
            long count = allAssets.stream().filter(a -> a.getCategory() == cat).count();
            if (count > 0) {
                Map<String, Object> map = new HashMap<>();
                map.put("name", cat.getDisplayName());
                map.put("value", count);
                catData.add(map);
            }
        }
        dto.setCategoryDistribution(catData);

        dto.setRecentActivity(activityLogService.getRecentActivities());

        return dto;
    }
}
