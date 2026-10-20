package com.robovault.faults.repository;

import com.robovault.faults.model.FaultReport;
import com.robovault.faults.model.FaultSeverity;
import com.robovault.faults.model.FaultStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaultReportRepository extends MongoRepository<FaultReport, String> {
    Page<FaultReport> findByStatus(FaultStatus status, Pageable pageable);
    Page<FaultReport> findBySeverity(FaultSeverity severity, Pageable pageable);
    List<FaultReport> findByAssetId(String assetId);
    long countByStatus(FaultStatus status);
    long countByStatusNot(FaultStatus status);
}
