package com.robovault.repository;

import com.robovault.model.CheckoutRecord;
import com.robovault.model.CheckoutStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckoutRecordRepository extends MongoRepository<CheckoutRecord, String> {
    List<CheckoutRecord> findByStatus(CheckoutStatus status);
    List<CheckoutRecord> findByAssetId(String assetId);
    List<CheckoutRecord> findByUserId(String userId);
    List<CheckoutRecord> findByProjectId(String projectId);
    long countByStatus(CheckoutStatus status);
}

