import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface OrderItem {
    id?: number;
    order_id?: number;
    product_id?: number;
    product_name?: string;
    product?: { name: string };
    quantity: number;
    unit_price: number;
}

interface Order {
    id?: number;
    created_at?: string;
    createdAt?: string;
    address?: string;
    items: OrderItem[];
    total: number;
}

function OrderHistory() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const formatDate = (value?: string) => value ? new Date(value).toLocaleString() : "-";

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const res = await fetch("/api/orders/my", {
                    credentials: "include",
                });
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "No se pudo cargar el historial");
                    return;
                }

                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setError("Error de red al cargar historial");
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 800, margin: "0 auto" }}>
                <h1>📦 Historial de Pedidos</h1>
                <p>Cargando historial...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 800, margin: "0 auto" }}>
            <h1>📦 Historial de Pedidos</h1>

            {error ? (
                <p style={{ color: "#b91c1c" }}>{error}</p>
            ) : orders.length === 0 ? (
                <p>No tienes pedidos guardados aún. Completa una compra para ver tu historial.</p>
            ) : (
                <div style={{ display: "grid", gap: 20 }}>
                    {orders.map((order, index) => (
                        <div key={order.id ?? index} style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8, background: "#fff" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <strong>Pedido #{order.id}</strong>
                                <span style={{ color: "#6b7280" }}>{formatDate(order.created_at ?? order.createdAt)}</span>
                            </div>
                            <p style={{ margin: "12px 0 0" }}>Dirección: {order.address}</p>
                            <ul style={{ marginTop: 10, paddingLeft: 18 }}>
                                {order.items.map((item) => (
                                    <li key={`${item.order_id}-${item.product_id}-${item.id}`}>
                                        {item.product_name || item.product?.name} x {item.quantity} = {(item.unit_price * item.quantity).toFixed(2)}€
                                    </li>
                                ))}
                            </ul>
                            <p style={{ marginTop: 10, fontWeight: "bold" }}>Total: {Number(order.total).toFixed(2)}€</p>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={() => navigate("/")}
                style={{
                    marginTop: 20,
                    padding: "10px 16px",
                    background: "#1677ff",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer"
                }}
            >
                Volver a la tienda
            </button>
        </div>
    );
}

export default OrderHistory;
