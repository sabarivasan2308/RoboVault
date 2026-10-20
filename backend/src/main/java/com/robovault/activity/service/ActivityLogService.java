package com.robovault.activity.service;

import com.robovault.activity.model.ActivityLog;
import com.robovault.activity.repository.ActivityLogRepository;
import com.robovault.common.response.PaginatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository repository;

    public ActivityLogService(ActivityLogRepository repository) {
        this.repository = repository;
    }

    public void log(String actor, String action, String entityType, String entityId, String description) {
        ActivityLog log = new ActivityLog(actor, action, entityType, entityId, description);
        repository.save(log);
    }

    public List<ActivityLog> getRecentActivities() {
        return repository.findTop20ByOrderByTimestampDesc();
    }

    public PaginatedResponse<ActivityLog> getLogsPaginated(int page, int size, String entityType) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<ActivityLog> pageResult = (entityType != null && !entityType.isEmpty())
                ? repository.findByEntityType(entityType, pageable)
                : repository.findAll(pageable);

        return new PaginatedResponse<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
    }
}
