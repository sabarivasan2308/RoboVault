package com.robovault.activity.repository;

import com.robovault.activity.model.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    List<ActivityLog> findTop20ByOrderByTimestampDesc();
    Page<ActivityLog> findByEntityType(String entityType, Pageable pageable);
}

