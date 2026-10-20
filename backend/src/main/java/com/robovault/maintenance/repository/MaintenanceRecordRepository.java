package com.robovault.maintenance.repository;

import com.robovault.maintenance.model.MaintenancePriority;
import com.robovault.maintenance.model.MaintenanceRecord;
import com.robovault.maintenance.model.MaintenanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends MongoRepository<MaintenanceRecord, String> {
    Page<MaintenanceRecord> findByStatus(MaintenanceStatus status, Pageable pageable);
    Page<MaintenanceRecord> findByPriority(MaintenancePriority priority, Pageable pageable);
    List<MaintenanceRecord> findByAssetId(String assetId);
    long countByStatus(MaintenanceStatus status);
}

