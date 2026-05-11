package com.ssunen.backend.dao;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class CatalogDAO {
    private final JdbcTemplate jdbc = new JdbcTemplate();

    public List<Map<String, Object>> findCities() throws SQLException {
        return jdbc.query("SELECT * FROM cities ORDER BY name");
    }

    public List<Map<String, Object>> findActivities(Integer cityId) throws SQLException {
        String sql = """
            SELECT
                a.*,
                p.name AS provider_name,
                COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS "avgRating"
            FROM activities a
            LEFT JOIN providers p ON p.id = a.provider_id
            LEFT JOIN reviews r ON r.activity_id = a.id
            """;
        if (cityId != null) {
            sql += " WHERE a.city_id = ? GROUP BY a.id, p.name ORDER BY a.id";
            return jdbc.query(sql, cityId);
        }
        sql += " GROUP BY a.id, p.name ORDER BY a.id";
        return jdbc.query(sql);
    }

    public Map<String, Object> findActivity(int id) throws SQLException {
        return jdbc.queryOne("""
            SELECT
                a.*,
                p.name AS provider_name,
                COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS "avgRating"
            FROM activities a
            LEFT JOIN providers p ON p.id = a.provider_id
            LEFT JOIN reviews r ON r.activity_id = a.id
            WHERE a.id = ?
            GROUP BY a.id, p.name
            """, id);
    }

    public Map<String, Object> createActivity(Integer providerId, int cityId, String name, String description,
                                             String category, BigDecimal price, Integer durationMinutes,
                                             Integer maxCapacity) throws SQLException {
        return jdbc.queryOne("""
            INSERT INTO activities (provider_id, city_id, name, description, category, price, duration_minutes, max_capacity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
            """, providerId, cityId, name, description, category, price, durationMinutes, maxCapacity);
    }

    public Map<String, Object> updateActivity(int id, Integer providerId, int cityId, String name, String description,
                                             String category, BigDecimal price, Integer durationMinutes,
                                             Integer maxCapacity) throws SQLException {
        return jdbc.queryOne("""
            UPDATE activities
            SET provider_id = ?, city_id = ?, name = ?, description = ?, category = ?, price = ?,
                duration_minutes = ?, max_capacity = ?
            WHERE id = ?
            RETURNING *
            """, providerId, cityId, name, description, category, price, durationMinutes, maxCapacity, id);
    }

    public boolean deleteActivity(int id) throws SQLException {
        return jdbc.queryOne("DELETE FROM activities WHERE id = ? RETURNING id", id) != null;
    }

    public List<Map<String, Object>> findReviews(int activityId) throws SQLException {
        return jdbc.query("""
            SELECT
                r.id,
                r.rating,
                r.comment,
                COALESCE(c.full_name, 'Anónimo') AS customer,
                r.created_at
            FROM reviews r
            LEFT JOIN customers c ON c.id = r.customer_id
            WHERE r.activity_id = ?
            ORDER BY r.created_at DESC
            """, activityId);
    }

    public Map<String, Object> upsertReview(int activityId, int rating, String comment, int customerId) throws SQLException {
        return jdbc.queryOne("""
            INSERT INTO reviews (activity_id, customer_id, rating, comment)
            VALUES (?, ?, ?, ?)
            ON CONFLICT (activity_id, customer_id)
            DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
            RETURNING *
            """, activityId, customerId, rating, comment);
    }

    public List<Map<String, Object>> findCommunityIdeas() throws SQLException {
        return jdbc.query("""
            SELECT
                s.id,
                s.suggested_name,
                s.description,
                s.category,
                s.suggested_price,
                s.max_capacity,
                s.duration_minutes,
                s.created_activity_id,
                s.reviewed_at,
                c.name AS city_name,
                c.country AS city_country,
                a.price,
                a.city_id
            FROM ai_plan_submissions s
            LEFT JOIN activities a ON a.id = s.created_activity_id
            LEFT JOIN cities c ON c.id = COALESCE(a.city_id, s.city_id)
            WHERE s.status = 'approved'
              AND s.created_activity_id IS NOT NULL
            ORDER BY s.reviewed_at DESC NULLS LAST, s.created_at DESC
            LIMIT 6
            """);
    }
}
