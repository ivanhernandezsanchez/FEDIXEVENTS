package com.ssunen.backend.dao;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class FichajeDAO {
    private final JdbcTemplate jdbc = new JdbcTemplate();

    public List<Map<String, Object>> findByCustomer(int customerId) throws SQLException {
        return jdbc.query("""
            SELECT id, customer_id, tipo, created_at
            FROM fichajes
            WHERE customer_id = ?
            ORDER BY created_at DESC
            """, customerId);
    }

    public Map<String, Object> insert(int customerId, String tipo) throws SQLException {
        return jdbc.queryOne("""
            INSERT INTO fichajes (customer_id, tipo, created_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            RETURNING id, customer_id, tipo, created_at
            """, customerId, tipo);
    }
}
