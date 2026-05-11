package com.ssunen.backend.dao;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class OrderDAO {
    private final JdbcTemplate jdbc = new JdbcTemplate();

    public List<Map<String, Object>> findAllOrders() throws SQLException {
        List<Map<String, Object>> bookings = jdbc.query("""
            SELECT
                b.id,
                g.organizer_id AS customer_id,
                b.status,
                b.total_price AS total,
                g.name AS address,
                b.created_at,
                c.full_name AS customer_name,
                c.email AS customer_email
            FROM bookings b
            LEFT JOIN groups g ON g.id = b.group_id
            LEFT JOIN customers c ON c.id = g.organizer_id
            ORDER BY b.created_at DESC
            """);
        attachItems(bookings);
        return bookings;
    }

    public List<Map<String, Object>> findMyOrders(int customerId) throws SQLException {
        List<Map<String, Object>> bookings = jdbc.query("""
            SELECT
                b.id,
                b.status,
                b.total_price AS total,
                g.name AS address,
                b.created_at
            FROM bookings b
            INNER JOIN groups g ON g.id = b.group_id
            WHERE g.organizer_id = ?
            ORDER BY b.created_at DESC
            """, customerId);
        attachItems(bookings);
        return bookings;
    }

    public Map<String, Object> createOrder(int customerId, List<Map<String, Object>> items, String address) throws SQLException {
        return jdbc.inTransaction(conn -> {
            Integer cityId = resolveCityId(conn, items);
            if (cityId == null) {
                throw new SQLException("No se pudo asociar el pedido a una ciudad");
            }

            BigDecimal total = BigDecimal.ZERO;
            for (Map<String, Object> item : items) {
                total = total.add(number(item.get("unitPrice")).multiply(BigDecimal.valueOf(number(item.get("quantity")).intValue())));
            }

            Map<String, Object> group = jdbc.queryOne(conn, """
                INSERT INTO groups (name, organizer_id, city_id, event_date, budget_per_person)
                VALUES (?, ?, ?, ?, ?)
                RETURNING *
                """, address, customerId, cityId, LocalDate.now(), total);

            Map<String, Object> booking = jdbc.queryOne(conn, """
                INSERT INTO bookings (group_id, total_price, status)
                VALUES (?, ?, 'pending')
                RETURNING *
                """, group.get("id"), total);

            List<Map<String, Object>> bookingItems = new ArrayList<>();
            for (Map<String, Object> item : items) {
                int activityId = number(first(item.get("activityId"), item.get("productId"))).intValue();
                int quantity = number(item.get("quantity")).intValue();
                BigDecimal unitPrice = number(item.get("unitPrice"));

                Map<String, Object> customPlan = object(item.get("customPlan"));
                if (customPlan != null && activityId < 0) {
                    Map<String, Object> customActivity = jdbc.queryOne(conn, """
                        INSERT INTO activities (provider_id, city_id, name, description, category, price, duration_minutes, max_capacity)
                        VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)
                        RETURNING id
                        """,
                        number(first(customPlan.get("cityId"), cityId)).intValue(),
                        truncate(String.valueOf(first(customPlan.get("name"), "Plan personalizado IA")), 150),
                        String.valueOf(first(customPlan.get("description"), "Plan personalizado creado desde el chat IA")),
                        truncate(String.valueOf(first(customPlan.get("category"), "Plan personalizado IA")), 100),
                        unitPrice,
                        number(first(customPlan.get("durationMinutes"), 240)).intValue(),
                        number(first(customPlan.get("maxCapacity"), quantity)).intValue());
                    activityId = ((Number) customActivity.get("id")).intValue();
                }

                if (activityId <= 0 || quantity <= 0 || unitPrice.compareTo(BigDecimal.ZERO) < 0) {
                    continue;
                }
                Map<String, Object> bookingItem = jdbc.queryOne(conn, """
                    INSERT INTO booking_items (booking_id, activity_id, quantity, unit_price)
                    VALUES (?, ?, ?, ?)
                    RETURNING *
                    """, booking.get("id"), activityId, quantity, unitPrice);
                bookingItems.add(bookingItem);
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("order", booking);
            response.put("items", bookingItems);
            return response;
        });
    }

    public Map<String, Object> updateStatus(int id, String status) throws SQLException {
        return jdbc.queryOne("UPDATE bookings SET status = ? WHERE id = ? RETURNING *", status, id);
    }

    private void attachItems(List<Map<String, Object>> bookings) throws SQLException {
        for (Map<String, Object> booking : bookings) {
            List<Map<String, Object>> items = jdbc.query("""
                SELECT
                    bi.id,
                    bi.booking_id AS order_id,
                    bi.activity_id AS product_id,
                    bi.quantity,
                    bi.unit_price,
                    a.name AS product_name,
                    NULL::text AS product_image_url
                FROM booking_items bi
                LEFT JOIN activities a ON a.id = bi.activity_id
                WHERE bi.booking_id = ?
                ORDER BY bi.id
                """, booking.get("id"));
            booking.put("items", items);
        }
    }

    private Integer resolveCityId(Connection conn, List<Map<String, Object>> items) throws SQLException {
        for (Map<String, Object> item : items) {
            int activityId = number(first(item.get("activityId"), item.get("productId"))).intValue();
            if (activityId > 0) {
                Map<String, Object> row = jdbc.queryOne(conn, "SELECT city_id FROM activities WHERE id = ?", activityId);
                if (row != null && row.get("city_id") != null) {
                    return ((Number) row.get("city_id")).intValue();
                }
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> object(Object value) {
        if (value instanceof Map<?, ?>) {
            return (Map<String, Object>) value;
        }
        return null;
    }

    private Object first(Object first, Object second) {
        return first == null ? second : first;
    }

    private String truncate(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }

    private BigDecimal number(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(String.valueOf(value));
    }
}
