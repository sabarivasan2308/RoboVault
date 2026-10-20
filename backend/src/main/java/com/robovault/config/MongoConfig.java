package com.robovault.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoAuditing
@EnableMongoRepositories(basePackages = {
        "com.robovault.users.repository",
        "com.robovault.assets.repository",
        "com.robovault.checkouts.repository",
        "com.robovault.maintenance.repository",
        "com.robovault.projects.repository",
        "com.robovault.faults.repository",
        "com.robovault.activity.repository"
})
public class MongoConfig {
}
