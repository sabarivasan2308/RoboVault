package com.robovault.repository;

import com.robovault.model.MaintenanceRecord;
import com.robovault.model.MaintenanceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends MongoRepository<MaintenanceRecord, String> {
    List<MaintenanceRecord> findByStatus(MaintenanceStatus status);
    List<MaintenanceRecord> findByAssetId(String assetId);
    long countByStatus(MaintenanceStatus status);
}

