package com.ssunen.backend.dao;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class AiPlanDAO {
    private final JdbcTemplate jdbc = new JdbcTemplate();

    public Map<String, Object> create(String suggestedName, Integer cityId, String description, String category,
                                     BigDecimal suggestedPrice, Integer maxCapacity, Integer durationMinutes) throws SQLException {
        return jdbc.queryOne("""
            INSERT INTO ai_plan_submissions (
                suggested_name, city_id, description, category, suggested_price, max_capacity, duration_minutes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING *
            """, suggestedName, cityId, description, category, suggestedPrice, maxCapacity, durationMinutes);
    }

    public List<Map<String, Object>> findAll() throws SQLException {
        return jdbc.query("""
            SELECT s.*, c.name AS city_name
            FROM ai_plan_submissions s
            LEFT JOIN cities c ON c.id = s.city_id
            ORDER BY s.created_at DESC
            """);
    }

    public Map<String, Object> findById(int id) throws SQLException {
        return jdbc.queryOne("SELECT * FROM ai_plan_submissions WHERE id = ?", id);
    }

    public Map<String, Object> reject(int id) throws SQLException {
        return jdbc.queryOne("""
            UPDATE ai_plan_submissions
            SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP
            WHERE id = ?
            RETURNING *
            """, id);
    }

    public Map<String, Object> approve(int id) throws SQLException {
        return jdbc.inTransaction(conn -> {
            Map<String, Object> submission = jdbc.queryOne(conn, "SELECT * FROM ai_plan_submissions WHERE id = ?", id);
            Map<String, Object> activity = jdbc.queryOne(conn, """
                INSERT INTO activities (provider_id, city_id, name, description, category, price, duration_minutes, max_capacity)
                VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)
                RETURNING *
                """,
                submission.get("city_id"),
                submission.get("suggested_name"),
                submission.get("description"),
                submission.get("category"),
                submission.get("suggested_price"),
                submission.get("duration_minutes"),
                submission.get("max_capacity"));
            jdbc.queryOne(conn, """
                UPDATE ai_plan_submissions
                SET status = 'approved', created_activity_id = ?, reviewed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                RETURNING id
                """, activity.get("id"), id);
            Map<String, Object> response = new LinkedHashMap<>();
            submission.put("status", "approved");
            submission.put("created_activity_id", activity.get("id"));
            response.put("submission", submission);
            response.put("activity", activity);
            return response;
        });
    }
}
