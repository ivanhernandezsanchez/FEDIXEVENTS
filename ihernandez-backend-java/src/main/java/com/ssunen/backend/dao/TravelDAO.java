package com.ssunen.backend.dao;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class TravelDAO {
    private final JdbcTemplate jdbc = new JdbcTemplate();

    public List<Map<String, Object>> findHotels(Integer cityId) throws SQLException {
        if (cityId != null) {
            return jdbc.query("SELECT * FROM hotels WHERE city_id = ? ORDER BY name", cityId);
        }
        return jdbc.query("SELECT * FROM hotels ORDER BY name");
    }

    public Map<String, Object> findHotel(int id) throws SQLException {
        return jdbc.queryOne("SELECT * FROM hotels WHERE id = ?", id);
    }

    public List<Map<String, Object>> findProviders(Integer cityId) throws SQLException {
        if (cityId != null) {
            return jdbc.query("SELECT * FROM providers WHERE city_id = ? ORDER BY name", cityId);
        }
        return jdbc.query("SELECT * FROM providers ORDER BY name");
    }

    public Map<String, Object> findProvider(int id) throws SQLException {
        return jdbc.queryOne("SELECT * FROM providers WHERE id = ?", id);
    }

    public List<Map<String, Object>> findGroupsForCustomer(int customerId) throws SQLException {
        return jdbc.query("""
            SELECT g.*
            FROM groups g
            INNER JOIN group_members gm ON gm.group_id = g.id
            WHERE gm.customer_id = ?
            ORDER BY g.event_date DESC
            """, customerId);
    }

    public Map<String, Object> findGroup(int id) throws SQLException {
        Map<String, Object> group = jdbc.queryOne("SELECT * FROM groups WHERE id = ?", id);
        if (group == null) {
            return null;
        }
        group.put("members", jdbc.query("""
            SELECT gm.*, c.full_name, c.email
            FROM group_members gm
            LEFT JOIN customers c ON c.id = gm.customer_id
            WHERE gm.group_id = ?
            """, id));
        return group;
    }

    public Map<String, Object> createGroup(String name, int organizerId, int cityId, String eventDate,
                                           BigDecimal budgetPerPerson) throws SQLException {
        return jdbc.inTransaction(conn -> {
            Map<String, Object> group = jdbc.queryOne(conn, """
                INSERT INTO groups (name, organizer_id, city_id, event_date, budget_per_person)
                VALUES (?, ?, ?, ?::date, ?)
                RETURNING *
                """, name, organizerId, cityId, eventDate, budgetPerPerson);
            jdbc.queryOne(conn, """
                INSERT INTO group_members (group_id, customer_id, role)
                VALUES (?, ?, 'organizer')
                RETURNING id
                """, group.get("id"), organizerId);
            return group;
        });
    }

    public Map<String, Object> addGroupMember(int groupId, int customerId, String role) throws SQLException {
        return jdbc.queryOne("""
            INSERT INTO group_members (group_id, customer_id, role)
            VALUES (?, ?, ?)
            RETURNING *
            """, groupId, customerId, role);
    }

    public List<Map<String, Object>> findBookingsForCustomer(int customerId) throws SQLException {
        return jdbc.query("""
            SELECT b.*, g.name AS group_name
            FROM bookings b
            INNER JOIN groups g ON g.id = b.group_id
            INNER JOIN group_members gm ON gm.group_id = g.id
            WHERE gm.customer_id = ?
            ORDER BY b.created_at DESC
            """, customerId);
    }

    public Map<String, Object> findBooking(int id) throws SQLException {
        Map<String, Object> booking = jdbc.queryOne("SELECT * FROM bookings WHERE id = ?", id);
        if (booking == null) {
            return null;
        }
        booking.put("items", jdbc.query("""
            SELECT bi.*, a.name AS activity_name
            FROM booking_items bi
            LEFT JOIN activities a ON a.id = bi.activity_id
            WHERE bi.booking_id = ?
            """, id));
        return booking;
    }

    public Map<String, Object> createBooking(int groupId, List<Map<String, Object>> items) throws SQLException {
        return jdbc.inTransaction(conn -> {
            BigDecimal total = BigDecimal.ZERO;
            for (Map<String, Object> item : items) {
                BigDecimal quantity = number(item.get("quantity"));
                BigDecimal unitPrice = number(item.get("unit_price"));
                total = total.add(unitPrice.multiply(quantity));
            }
            Map<String, Object> booking = jdbc.queryOne(conn, """
                INSERT INTO bookings (group_id, total_price, status)
                VALUES (?, ?, 'pending')
                RETURNING *
                """, groupId, total);
            List<Map<String, Object>> bookingItems = new java.util.ArrayList<>();
            for (Map<String, Object> item : items) {
                Map<String, Object> bookingItem = jdbc.queryOne(conn, """
                    INSERT INTO booking_items (booking_id, activity_id, quantity, unit_price)
                    VALUES (?, ?, ?, ?)
                    RETURNING *
                    """,
                    booking.get("id"),
                    number(item.get("activity_id")).intValue(),
                    number(item.get("quantity")).intValue(),
                    number(item.get("unit_price")));
                bookingItems.add(bookingItem);
            }
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("booking", booking);
            response.put("items", bookingItems);
            return response;
        });
    }

    public Map<String, Object> updateBookingStatus(int id, String status) throws SQLException {
        return jdbc.queryOne("UPDATE bookings SET status = ? WHERE id = ? RETURNING *", status, id);
    }

    public List<Map<String, Object>> findPaymentsForCustomer(int customerId) throws SQLException {
        return jdbc.query("""
            SELECT p.*, b.group_id
            FROM payments p
            INNER JOIN bookings b ON b.id = p.booking_id
            INNER JOIN groups g ON g.id = b.group_id
            INNER JOIN group_members gm ON gm.group_id = g.id
            WHERE gm.customer_id = ?
            ORDER BY p.paid_at DESC
            """, customerId);
    }

    public Map<String, Object> createPayment(int bookingId, BigDecimal amount, String method) throws SQLException {
        return jdbc.queryOne("""
            INSERT INTO payments (booking_id, amount, method, status, paid_at)
            VALUES (?, ?, ?, 'paid', NOW())
            RETURNING *
            """, bookingId, amount, method);
    }

    public List<Map<String, Object>> findPaymentsByBooking(int bookingId) throws SQLException {
        return jdbc.query("SELECT * FROM payments WHERE booking_id = ? ORDER BY paid_at DESC", bookingId);
    }

    private BigDecimal number(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(String.valueOf(value));
    }
}
