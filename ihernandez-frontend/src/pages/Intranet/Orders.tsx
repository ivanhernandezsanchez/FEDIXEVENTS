import { useState, useEffect } from "react";
import { useUser } from "../../UserContext";

interface Order {
    id: number;
    customer_id: number;
    status: string;
    total: number;
    address: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    items: Array<{
        id: number;
        order_id: number;
        product_id: number;
        quantity: number;
        unit_price: number;
        product_name: string;
        product_image_url: string;
    }>;
}

function Orders() {
    const { user } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState<number | null>(null);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders", {
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "No se pudieron cargar los pedidos");
                return;
            }
            if (Array.isArray(data)) setOrders(data);
        } catch (e) {
            console.error(e);
            setError("Error al conectar con el servidor");
        }
    };

    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        setUpdating(orderId);
        setError("");

        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Error al actualizar el estado");
                return;
            }

            setOrders(prev => prev.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (e) {
            console.error(e);
            setError("Error al conectar con el servidor");
        } finally {
            setUpdating(null);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const canManageOrders = user?.role === "admin" || user?.role === "employee";

    if (!canManageOrders) {
        return <div>No tienes permisos para acceder a esta página.</div>;
    }

    return (
        <div>
            <h2>Gestión de Pedidos</h2>
            <p>Visualiza y administra todos los pedidos de la plataforma.</p>
            {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

            <div style={{ marginBottom: 20 }}>
                <button 
                    onClick={fetchOrders}
                    style={{ background: "#3b82f6", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}
                >
                    Actualizar Lista
                </button>
            </div>

            {orders.length === 0 ? (
                <p>No hay pedidos.</p>
            ) : (
                orders.map(order => (
                    <div key={order.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 20, marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <h3>Pedido #{order.id}</h3>
                            <div>
                                <label>Estado: </label>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    disabled={updating === order.id}
                                    style={{ padding: 5, marginLeft: 10 }}
                                >
                                    <option value="pending">Pendiente</option>
                                    <option value="confirmed">Confirmado</option>
                                    <option value="processing">Procesando</option>
                                    <option value="shipped">Enviado</option>
                                    <option value="delivered">Entregado</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                                {updating === order.id && <span style={{ marginLeft: 10 }}>Actualizando...</span>}
                            </div>
                        </div>
                        <p><strong>Cliente:</strong> {order.customer_name} ({order.customer_email})</p>
                        <p><strong>Grupo:</strong> {order.address}</p>
                        <p><strong>Total:</strong> {Number(order.total).toFixed(2)} €</p>
                        <p><strong>Fecha:</strong> {new Date(order.created_at).toLocaleString()}</p>
                        
                        <h4>Productos:</h4>
                        <ul>
                            {order.items.map(item => (
                                <li key={item.id}>
                                    {item.product_name} - Cantidad: {item.quantity} - Precio: {Number(item.unit_price).toFixed(2)} €
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </div>
    );
}

export default Orders;
