package com.robovault.repository;

import com.robovault.model.FaultReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaultReportRepository extends MongoRepository<FaultReport, String> {
    List<FaultReport> findByStatus(String status);
    List<FaultReport> findByAssetId(String assetId);
    long countByStatus(String status);
}

