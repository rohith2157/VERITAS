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
            log.info(">>> [DATABASE ENGINE] Production DATABASE_URL DETECTED. Connecting to cloud PostgreSQL database...");
            try {
                String cleanUri = envDbUrl.startsWith("jdbc:") ? envDbUrl.substring(5) : envDbUrl;
                java.net.URI dbUri = new java.net.URI(cleanUri);
                String host = dbUri.getHost();
                int port = dbUri.getPort() > 0 ? dbUri.getPort() : 5432;
                String path = dbUri.getPath();
                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                config.setJdbcUrl(jdbcUrl);

                String userInfo = dbUri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    config.setUsername(parts[0]);
                    config.setPassword(parts[1]);
                } else {
                    String dbUser = System.getenv("SPRING_DATASOURCE_USERNAME");
                    String dbPass = System.getenv("SPRING_DATASOURCE_PASSWORD");
                    if (dbUser != null) config.setUsername(dbUser);
                    if (dbPass != null) config.setPassword(dbPass);
                }
                config.setDriverClassName("org.postgresql.Driver");
                config.setPoolName("VeritasCloudPostgreSqlPool");
                config.setConnectionTimeout(10000);
                config.setMaximumPoolSize(4);
                config.setMinimumIdle(1);
                return new HikariDataSource(config);
            } catch (Exception e) {
                log.warn(">>> [DATABASE ENGINE] Could not parse DATABASE_URL ({}), falling back to H2.", e.getMessage());
            }
        }

        if (checkPostgresPort("localhost", 2157, 500)) {
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

        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
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

