package com.robovault.checkouts.repository;

import com.robovault.checkouts.model.CheckoutRecord;
import com.robovault.checkouts.model.CheckoutStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CheckoutRecordRepository extends MongoRepository<CheckoutRecord, String> {
    Optional<CheckoutRecord> findByRequestId(String requestId);
    Page<CheckoutRecord> findByStatus(CheckoutStatus status, Pageable pageable);
    Page<CheckoutRecord> findByUserEmail(String userEmail, Pageable pageable);
    List<CheckoutRecord> findByAssetId(String assetId);
    List<CheckoutRecord> findByAssetIdAndStatusIn(String assetId, List<CheckoutStatus> statuses);
    long countByStatus(CheckoutStatus status);
}

