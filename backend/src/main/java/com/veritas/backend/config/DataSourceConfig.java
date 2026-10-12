package com.veritas.backend.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.InetSocketAddress;
import java.net.Socket;

/**
 * Intelligent self-healing dual-mode DataSource configuration.
 * - If PostgreSQL is online on port 2157: connects to PostgreSQL (veritasdb)
 * - If PostgreSQL is offline: gracefully falls back to embedded in-memory H2 database
 * Never crashes Spring Boot on startup.
 */
@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Bean
    @Primary
    public DataSource dataSource() {
        String envDbUrl = System.getenv("DATABASE_URL");
        if (envDbUrl == null || envDbUrl.isBlank()) {
            envDbUrl = System.getenv("SPRING_DATASOURCE_URL");
        }

        HikariConfig config = new HikariConfig();

        if (envDbUrl != null && !envDbUrl.isBlank()) {
            log.info(">>> [DATABASE ENGINE] Production DATABASE_URL DETECTED. Connecting to cloud database...");
            // Handle postgres:// URI scheme if passed directly by cloud providers
            String jdbcUrl = envDbUrl;
            if (jdbcUrl.startsWith("postgres://")) {
                jdbcUrl = jdbcUrl.replaceFirst("postgres://", "jdbc:postgresql://");
            } else if (jdbcUrl.startsWith("postgresql://") && !jdbcUrl.startsWith("jdbc:postgresql://")) {
                jdbcUrl = "jdbc:" + jdbcUrl;
            }
            config.setJdbcUrl(jdbcUrl);
            String dbUser = System.getenv("SPRING_DATASOURCE_USERNAME");
            String dbPass = System.getenv("SPRING_DATASOURCE_PASSWORD");
            if (dbUser != null) config.setUsername(dbUser);
            if (dbPass != null) config.setPassword(dbPass);
            config.setDriverClassName("org.postgresql.Driver");
            config.setPoolName("VeritasCloudPostgreSqlPool");
            config.setConnectionTimeout(5000);
        } else if (checkPostgresPort("localhost", 2157, 500)) {
            log.info(">>> [DATABASE ENGINE] Local PostgreSQL port 2157 DETECTED. Connecting to PostgreSQL (veritasdb)...");
            config.setJdbcUrl("jdbc:postgresql://localhost:2157/veritasdb");
            config.setUsername("postgres");
            config.setPassword("8333035340");
            config.setDriverClassName("org.postgresql.Driver");
            config.setPoolName("VeritasPostgreSqlPool");
            config.setConnectionTimeout(3000);
        } else {
            log.warn(">>> [DATABASE ENGINE] PostgreSQL NOT DETECTED. Self-healing fallback: Initializing embedded in-memory H2 database.");
            config.setJdbcUrl("jdbc:h2:mem:veritasdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=PostgreSQL");
            config.setUsername("sa");
            config.setPassword("");
            config.setDriverClassName("org.h2.Driver");
            config.setPoolName("VeritasH2FallbackPool");
            config.setConnectionTimeout(3000);
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        return new HikariDataSource(config);
    }

    private boolean checkPostgresPort(String host, int port, int timeoutMs) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeoutMs);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

