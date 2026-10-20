package com.robovault.projects.repository;

import com.robovault.projects.model.Project;
import com.robovault.projects.model.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {
    Optional<Project> findByCode(String code);
    boolean existsByCode(String code);
    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);
    long countByStatus(ProjectStatus status);
}
