import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface OrderItem {
    id?: number;
    order_id?: number;
    product_id?: number;
    activity_id?: number;
    product_name?: string;
    activity_name?: string;
    product?: { name: string };
    quantity: number;
    unit_price: number;
}

interface Order {
    id?: number;
    created_at?: string;
    createdAt?: string;
    address?: string;
    status?: string;
    items: OrderItem[];
    total: number;
}

const statusLabel: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
};

function OrderHistory() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const formatDate = (value?: string) =>
        value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "-";

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const res = await fetch("/api/orders/my", { credentials: "include" });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || "Could not load order history");
                    return;
                }
                setOrders(Array.isArray(data) ? data : []);
            } catch {
                setError("Network error loading order history");
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);

    if (loading) {
        return (
            <main style={s.page}>
                <p style={{ color: "#9ca3af", padding: "3rem 0" }}>Loading order history...</p>
            </main>
        );
    }

    return (
        <main style={s.page}>
            <span style={s.kicker}>My account</span>
            <h1 style={s.h1}>Order history</h1>

            {error ? (
                <div style={s.errorBox}>{error}</div>
            ) : orders.length === 0 ? (
                <div style={s.emptyBox}>
                    <p style={{ color: "#9ca3af", margin: 0 }}>No orders yet. Complete a booking to see your history.</p>
                    <button onClick={() => navigate("/catalog")} style={s.primaryBtn}>View catalogue</button>
                </div>
            ) : (
                <div style={s.grid}>
                    {orders.map((order, index) => (
                        <article key={order.id ?? index} style={s.card}>
                            <div style={s.cardHead}>
                                <div>
                                    <strong style={{ color: "#F3F4F6", fontSize: "1rem" }}>Order #{order.id}</strong>
                                    {order.address && (
                                        <p style={{ color: "#A855F7", fontSize: "0.85rem", margin: "4px 0 0" }}>{order.address}</p>
                                    )}
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span style={{
                                        background: order.status === "confirmed" ? "rgba(34,197,94,0.15)" : "rgba(168,85,247,0.15)",
                                        border: `1px solid ${order.status === "confirmed" ? "rgba(34,197,94,0.4)" : "rgba(168,85,247,0.35)"}`,
                                        borderRadius: 999,
                                        color: order.status === "confirmed" ? "#86efac" : "#c4b5fd",
                                        fontSize: "0.78rem",
                                        fontWeight: 700,
                                        padding: "3px 10px",
                                    }}>
                                        {statusLabel[order.status ?? ""] ?? order.status ?? "Pending"}
                                    </span>
                                    <p style={{ color: "#6b7280", fontSize: "0.8rem", margin: "6px 0 0" }}>{formatDate(order.created_at ?? order.createdAt)}</p>
                                </div>
                            </div>

                            {order.items.length > 0 && (
                                <ul style={s.itemList}>
                                    {order.items.map((item, i) => (
                                        <li key={i} style={s.item}>
                                            <span style={{ color: "#d1d5db" }}>
                                                {item.activity_name || item.product_name || item.product?.name || `Actividad #${item.activity_id ?? item.product_id}`}
                                            </span>
                                            <span style={{ color: "#9ca3af", whiteSpace: "nowrap" }}>
                                                x{item.quantity} · {(Number(item.unit_price) * item.quantity).toFixed(2)} €
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div style={s.cardFoot}>
                                <span style={{ color: "#9ca3af", fontSize: "0.88rem" }}>Estimated total</span>
                                <strong style={{ color: "#F97316", fontSize: "1.1rem" }}>{Number(order.total).toFixed(2)} €</strong>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <button onClick={() => navigate("/")} style={{ ...s.primaryBtn, marginTop: "2rem" }}>
                ← Back to shop
            </button>
        </main>
    );
}

const s: Record<string, React.CSSProperties> = {
    page: {
        maxWidth: 860,
        margin: "0 auto",
        padding: "2.5rem 1.5rem",
        fontFamily: "Trebuchet MS, Arial, sans-serif",
    },
    kicker: {
        color: "#A855F7",
        display: "block",
        fontSize: "0.78rem",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "0.4rem",
    },
    h1: {
        color: "#F3F4F6",
        fontSize: "2rem",
        fontWeight: 900,
        margin: "0 0 1.75rem",
    },
    grid: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    card: {
        background: "rgba(30,27,75,0.55)",
        border: "1px solid rgba(168,85,247,0.2)",
        borderRadius: 12,
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    cardHead: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "1rem",
    },
    itemList: {
        listStyle: "none",
        margin: 0,
        padding: 0,
        borderTop: "1px solid rgba(168,85,247,0.12)",
        paddingTop: "0.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
    },
    item: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        fontSize: "0.9rem",
    },
    cardFoot: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid rgba(168,85,247,0.12)",
        paddingTop: "0.75rem",
    },
    errorBox: {
        background: "rgba(220,38,38,0.12)",
        border: "1px solid rgba(220,38,38,0.3)",
        borderRadius: 10,
        color: "#fca5a5",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
    },
    emptyBox: {
        background: "rgba(30,27,75,0.5)",
        border: "1px solid rgba(168,85,247,0.2)",
        borderRadius: 12,
        padding: "3rem 2rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
    },
    primaryBtn: {
        background: "linear-gradient(135deg,#DB2777,#F97316)",
        border: "none",
        borderRadius: 999,
        color: "#fff",
        cursor: "pointer",
        fontWeight: 800,
        padding: "0.85rem 1.5rem",
        fontSize: "0.95rem",
    },
};

export default OrderHistory;
