package com.robovault.dashboard.dto;

import com.robovault.activity.model.ActivityLog;
import com.robovault.checkouts.model.CheckoutRecord;

import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {
    private long totalAssets;
    private long totalInventoryUnits;
    private long availableAssets;
    private long inUseAssets;
    private long reservedAssets;
    private long maintenanceAssets;
    private long damagedAssets;
    private long lostAssets;
    private long retiredAssets;

    private long pendingCheckouts;
    private long overdueCheckouts;
    private long openFaultReports;
    private long activeProjects;
    private double utilizationRate;

    private List<Map<String, Object>> statusDistribution;
    private List<Map<String, Object>> categoryDistribution;
    private List<CheckoutRecord> overdueList;
    private List<ActivityLog> recentActivity;

    public DashboardSummaryDto() {
    }

    public long getTotalAssets() {
        return totalAssets;
    }

    public void setTotalAssets(long totalAssets) {
        this.totalAssets = totalAssets;
    }

    public long getTotalInventoryUnits() {
        return totalInventoryUnits;
    }

    public void setTotalInventoryUnits(long totalInventoryUnits) {
        this.totalInventoryUnits = totalInventoryUnits;
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

    public long getReservedAssets() {
        return reservedAssets;
    }

    public void setReservedAssets(long reservedAssets) {
        this.reservedAssets = reservedAssets;
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

    public long getLostAssets() {
        return lostAssets;
    }

    public void setLostAssets(long lostAssets) {
        this.lostAssets = lostAssets;
    }

    public long getRetiredAssets() {
        return retiredAssets;
    }

    public void setRetiredAssets(long retiredAssets) {
        this.retiredAssets = retiredAssets;
    }

    public long getPendingCheckouts() {
        return pendingCheckouts;
    }

    public void setPendingCheckouts(long pendingCheckouts) {
        this.pendingCheckouts = pendingCheckouts;
    }

    public long getOverdueCheckouts() {
        return overdueCheckouts;
    }

    public void setOverdueCheckouts(long overdueCheckouts) {
        this.overdueCheckouts = overdueCheckouts;
    }

    public long getOpenFaultReports() {
        return openFaultReports;
    }

    public void setOpenFaultReports(long openFaultReports) {
        this.openFaultReports = openFaultReports;
    }

    public long getActiveProjects() {
        return activeProjects;
    }

    public void setActiveProjects(long activeProjects) {
        this.activeProjects = activeProjects;
    }

    public double getUtilizationRate() {
        return utilizationRate;
    }

    public void setUtilizationRate(double utilizationRate) {
        this.utilizationRate = utilizationRate;
    }

    public List<Map<String, Object>> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(List<Map<String, Object>> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }

    public List<Map<String, Object>> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(List<Map<String, Object>> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }

    public List<CheckoutRecord> getOverdueList() {
        return overdueList;
    }

    public void setOverdueList(List<CheckoutRecord> overdueList) {
        this.overdueList = overdueList;
    }

    public List<ActivityLog> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<ActivityLog> recentActivity) {
        this.recentActivity = recentActivity;
    }
}

