package com.robovault.service;

import com.robovault.model.ActivityLog;
import com.robovault.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public void log(String action, String entityType, String entityId, String description, String performedBy) {
        ActivityLog log = new ActivityLog(action, entityType, entityId, description, performedBy != null ? performedBy : "System");
        activityLogRepository.save(log);
    }

    public List<ActivityLog> getRecentActivities() {
        return activityLogRepository.findTop20ByOrderByTimestampDesc();
    }
}

