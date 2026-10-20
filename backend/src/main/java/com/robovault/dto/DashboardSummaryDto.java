package com.robovault.dto;

import com.robovault.model.ActivityLog;
import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {
    private long totalAssets;
    private long availableAssets;
    private long inUseAssets;
    private long maintenanceAssets;
    private long damagedAssets;
    private long overdueAssets;
    private long activeProjects;
    private long openFaultReports;
    private Map<String, Long> categoryDistribution;
    private Map<String, Long> statusDistribution;
    private List<ActivityLog> recentActivity;

    public DashboardSummaryDto() {
    }

    public long getTotalAssets() {
        return totalAssets;
    }

    public void setTotalAssets(long totalAssets) {
        this.totalAssets = totalAssets;
    }

    public long getAvailableAssets() {
        return availableAssets;
    }

    public void setAvailableAssets(long availableAssets) {
        this.availableAssets = availableAssets;
    }

    public long getInUseAssets() {
        return inUseAssets;
    }

    public void setInUseAssets(long inUseAssets) {
        this.inUseAssets = inUseAssets;
    }

    public long getMaintenanceAssets() {
        return maintenanceAssets;
    }

    public void setMaintenanceAssets(long maintenanceAssets) {
        this.maintenanceAssets = maintenanceAssets;
    }

    public long getDamagedAssets() {
        return damagedAssets;
    }

    public void setDamagedAssets(long damagedAssets) {
        this.damagedAssets = damagedAssets;
    }

    public long getOverdueAssets() {
        return overdueAssets;
    }

    public void setOverdueAssets(long overdueAssets) {
        this.overdueAssets = overdueAssets;
    }

    public long getActiveProjects() {
        return activeProjects;
    }

    public void setActiveProjects(long activeProjects) {
        this.activeProjects = activeProjects;
    }

    public long getOpenFaultReports() {
        return openFaultReports;
    }

    public void setOpenFaultReports(long openFaultReports) {
        this.openFaultReports = openFaultReports;
    }

    public Map<String, Long> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(Map<String, Long> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }

    public Map<String, Long> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(Map<String, Long> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }

    public List<ActivityLog> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<ActivityLog> recentActivity) {
        this.recentActivity = recentActivity;
    }
}

