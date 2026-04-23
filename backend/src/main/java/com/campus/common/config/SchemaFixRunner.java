package com.campus.common.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class SchemaFixRunner {

    @Bean
    CommandLineRunner ensureIncidentAttachmentBlobColumn(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE incident_attachments MODIFY COLUMN data LONGBLOB NOT NULL");
            } catch (Exception ignored) {
                // Ignore startup schema patch failures; app still runs with existing schema.
            }
        };
    }
}
