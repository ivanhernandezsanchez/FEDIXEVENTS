package com.ssunen.backend.dao;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class UserDAO {
    private final JdbcTemplate jdbc = new JdbcTemplate();

    public Map<String, Object> findByEmail(String email) throws SQLException {
        return jdbc.queryOne("SELECT * FROM customers WHERE email = ?", email);
    }

    public Map<String, Object> findById(int id) throws SQLException {
        return jdbc.queryOne("SELECT id, email, full_name, username, role FROM customers WHERE id = ?", id);
    }

    public List<Map<String, Object>> findAllManaged() throws SQLException {
        return jdbc.query("""
            SELECT id, email, full_name, username, role, full_name AS name
            FROM customers
            ORDER BY id
            """);
    }

    public Map<String, Object> create(String email, String passwordHash, String fullName, String username, String role) throws SQLException {
        return jdbc.queryOne("""
            INSERT INTO customers (email, password_hash, full_name, username, role)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id, email, full_name, username, role, full_name AS name
            """, email, passwordHash, fullName, username, role);
    }

    public Map<String, Object> update(int id, String email, String fullName, String role) throws SQLException {
        return jdbc.queryOne("""
            UPDATE customers
            SET email = ?, full_name = ?, role = ?
            WHERE id = ?
            RETURNING id, email, full_name, username, role, full_name AS name
            """, email, fullName, role, id);
    }

    public boolean delete(int id) throws SQLException {
        return jdbc.queryOne("DELETE FROM customers WHERE id = ? RETURNING id", id) != null;
    }
}
