package com.robovault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class RoboVaultApplication {

    public static void main(String[] args) {
        SpringApplication.run(RoboVaultApplication.class, args);
    }
}
