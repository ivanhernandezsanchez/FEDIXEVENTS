package com.ssunen.backend.dao;

import java.sql.SQLException;

public class SchemaDAO {
    private final JdbcTemplate jdbc = new JdbcTemplate();

    public void ensureOperationalSchema() throws SQLException {
        jdbc.update("ALTER TABLE customers ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer'");
        jdbc.update("""
            CREATE TABLE IF NOT EXISTS ai_plan_submissions (
                id SERIAL PRIMARY KEY,
                suggested_name VARCHAR(150) NOT NULL,
                city_id INTEGER REFERENCES cities(id),
                description TEXT NOT NULL,
                category VARCHAR(100) DEFAULT 'Plan personalizado IA',
                suggested_price NUMERIC(10,2) DEFAULT 0,
                max_capacity INTEGER,
                duration_minutes INTEGER,
                status VARCHAR(20) DEFAULT 'pending',
                created_activity_id INTEGER REFERENCES activities(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP
            )
            """);
        jdbc.update("""
            CREATE TABLE IF NOT EXISTS fichajes (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
                tipo VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """);
        jdbc.update("""
            UPDATE customers
            SET role = 'admin'
            WHERE id = (SELECT MIN(id) FROM customers)
              AND COALESCE(role, 'customer') = 'customer'
            """);
    }
}
