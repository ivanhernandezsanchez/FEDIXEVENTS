package com.ssunen.backend.dao;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import java.sql.Connection;
import java.sql.SQLException;

public class DatabaseConnection {

    private static HikariDataSource dataSource;

    static {
        try {
            Class.forName("org.postgresql.Driver");

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(env("DB_URL", "jdbc:postgresql://database-2.cc3wjciy7n5x.us-east-1.rds.amazonaws.com:5432/postgres"));
            config.setUsername(env("DB_USER", "postgres"));
            config.setPassword(env("DB_PASSWORD", "12345678"));

            config.addDataSourceProperty("ssl", env("DB_SSL", "true"));
            config.addDataSourceProperty("sslmode", env("DB_SSL_MODE", "require"));
            config.addDataSourceProperty("sslfactory", "org.postgresql.ssl.NonValidatingFactory");

            config.setMaximumPoolSize(Integer.parseInt(env("DB_POOL_MAX", "10")));
            config.setMinimumIdle(Integer.parseInt(env("DB_POOL_MIN_IDLE", "2")));
            config.setIdleTimeout(Long.parseLong(env("DB_IDLE_TIMEOUT_MS", "30000")));
            config.setConnectionTimeout(Long.parseLong(env("DB_CONNECTION_TIMEOUT_MS", "10000")));
            config.setPoolName("ihernandez-aws-postgres");

            dataSource = new HikariDataSource(config);
        } catch (ClassNotFoundException | RuntimeException e) {
            System.err.println("Error fatal inicializando el pool de conexiones: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private DatabaseConnection() {}

    public static Connection getConnection() throws SQLException {
        if (dataSource == null) {
            throw new SQLException("El pool de conexiones no se ha inicializado correctamente");
        }
        return dataSource.getConnection();
    }

    private static String env(String key, String fallback) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            value = System.getProperty(key);
        }
        return value == null || value.isBlank() ? fallback : value;
    }
}
