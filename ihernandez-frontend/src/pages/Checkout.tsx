import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Activity, CartItem } from "../types";
import { addActivityToCart, readCart, saveCart } from "../cart";
import { getActivityImage } from "../visuals";

function CheckoutPage() {
    const navigate = useNavigate();

    const [cart, setCart] = useState<CartItem[]>(readCart);
    const [groupName, setGroupName] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [notes, setNotes] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [recommendations, setRecommendations] = useState<Activity[]>([]);

    useEffect(() => {
        fetch("/api/activities")
            .then((res) => res.json())
            .then((data) => setRecommendations(Array.isArray(data) ? data : []))
            .catch(() => setRecommendations([]));
    }, []);

    const subtotal = cart.reduce(
        (acc, item) => acc + Number(item.product.price) * item.quantity,
        0
    );
    const managementFee = cart.length > 0 ? Math.max(10, subtotal * 0.05) : 0;
    const total = subtotal + managementFee;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const selectedIds = useMemo(
        () => new Set(cart.map((item) => item.product.id)),
        [cart]
    );

    const suggestedActivities = recommendations
        .filter((activity) => !selectedIds.has(activity.id))
        .slice(0, 3);

    const persistCart = (nextCart: CartItem[]) => {
        setCart(nextCart);
        saveCart(nextCart);
    };

    const updateQuantity = (productId: number, quantity: number) => {
        const nextQuantity = Math.max(0, Math.min(99, quantity || 0));
        const nextCart = nextQuantity === 0
            ? cart.filter((item) => item.product.id !== productId)
            : cart.map((item) =>
                item.product.id === productId ? { ...item, quantity: nextQuantity } : item
            );
        persistCart(nextCart);
    };

    const removeItem = (productId: number) => {
        persistCart(cart.filter((item) => item.product.id !== productId));
    };

    const clearCart = () => {
        persistCart([]);
        setMessage("Carrito vaciado.");
    };

    const addSuggestedActivity = (activity: Activity) => {
        addActivityToCart(activity);
        setCart(readCart());
        setMessage(`${activity.name} añadido al carrito.`);
    };

    const handleOrder = async () => {
        setMessage("");

        if (!groupName.trim()) {
            setMessage("Indica un nombre de grupo o referencia.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    items: cart.map((item) => ({
                        activityId: item.product.id,
                        quantity: item.quantity,
                        unitPrice: Number(item.product.price),
                        customPlan: item.customPlan
                            ? {
                                name: item.product.name,
                                description: item.product.description,
                                category: item.product.category,
                                cityId: item.product.city_id,
                                durationMinutes: item.product.duration_minutes,
                                maxCapacity: item.product.max_capacity,
                            }
                            : undefined,
                    })),
                    address: eventDate
                        ? `${groupName.trim()} · ${eventDate}${notes.trim() ? ` · ${notes.trim()}` : ""}`
                        : `${groupName.trim()}${notes.trim() ? ` · ${notes.trim()}` : ""}`,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.error || "Error al procesar pedido");
                return;
            }

            saveCart([]);
            setCart([]);
            setGroupName("");
            setEventDate("");
            setNotes("");

            navigate("/history");
        } catch {
            setMessage("Error al procesar pedido");
        } finally {
            setSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return (
            <main style={styles.container}>
                <section style={styles.emptyState}>
                    <span style={styles.emptyIcon}>Carrito</span>
                    <h1 style={styles.title}>Tu carrito está vacío</h1>
                    <p style={styles.muted}>Añade actividades desde el catálogo para preparar una reserva para tu grupo.</p>
                    <div style={styles.emptyActions}>
                        <button onClick={() => navigate("/catalog")} style={styles.primaryButton}>
                            Ver catálogo
                        </button>
                        <button onClick={() => navigate("/contact")} style={styles.lightButton}>
                            Pedir recomendación
                        </button>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main style={styles.container}>
            <section style={styles.header}>
                <div>
                    <span style={styles.kicker}>Proceso de compra</span>
                    <h1 style={styles.title}>Carrito y reserva</h1>
                    <p style={styles.muted}>Revisa actividades, ajusta asistentes y confirma la solicitud para que el equipo la gestione.</p>
                </div>
                <button onClick={() => navigate("/catalog")} style={styles.lightButton}>
                    Seguir comprando
                </button>
            </section>

            <section style={styles.layout}>
                <div style={styles.cartPanel}>
                    <div style={styles.panelHeader}>
                        <h2 style={styles.panelTitle}>Actividades seleccionadas</h2>
                        <button onClick={clearCart} style={styles.dangerButton}>Vaciar carrito</button>
                    </div>

                    <div style={styles.itemList}>
                        {cart.map((item) => {
                            const price = Number(item.product.price);
                            const lineTotal = price * item.quantity;
                            const pricePending = item.customPlan && price === 0;

                            return (
                                <article key={item.product.id} style={styles.item}>
                                    <button
                                        onClick={() => {
                                            if (item.customPlan) return;
                                            navigate(`/activity/${item.product.id}`);
                                        }}
                                        style={{
                                            ...styles.itemThumb,
                                            backgroundImage: `linear-gradient(180deg, rgba(29,16,40,0.1), rgba(29,16,40,0.72)), url('${getActivityImage(item.product)}')`,
                                        }}
                                    >
                                        <span style={styles.itemThumbLabel}>{item.customPlan ? "Plan IA" : "Ver"}</span>
                                    </button>

                                    <div style={styles.itemInfo}>
                                        <h3 style={styles.itemTitle}>{item.product.name}</h3>
                                        <p style={styles.itemMeta}>
                                            {item.product.category}
                                            {item.customPlan ? " · a medida" : ""}
                                            {item.product.provider_name ? ` · ${item.product.provider_name}` : ""}
                                        </p>
                                        <p style={styles.itemDescription}>{item.product.description}</p>
                                    </div>

                                    <div style={styles.quantityBox}>
                                        <span style={styles.price}>{pricePending ? "A consultar" : `${price.toFixed(2)} €`}</span>
                                        <div style={styles.stepper}>
                                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={styles.stepButton}>-</button>
                                            <input
                                                min={0}
                                                max={99}
                                                type="number"
                                                value={item.quantity}
                                                onChange={(event) => updateQuantity(item.product.id, Number(event.target.value))}
                                                style={styles.quantityInput}
                                            />
                                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={styles.stepButton}>+</button>
                                        </div>
                                        <strong style={styles.lineTotal}>{pricePending ? "Precio abierto" : `${lineTotal.toFixed(2)} €`}</strong>
                                        <button onClick={() => removeItem(item.product.id)} style={styles.removeButton}>Quitar</button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {suggestedActivities.length > 0 && (
                        <section style={styles.suggestions}>
                            <h2 style={styles.panelTitle}>Ideas para completar el plan</h2>
                            <div style={styles.suggestionGrid}>
                                {suggestedActivities.map((activity) => (
                                    <article key={activity.id} style={styles.suggestionCard}>
                                        <strong>{activity.name}</strong>
                                        <span style={styles.itemMeta}>{activity.category} · {Number(activity.price).toFixed(2)} €</span>
                                        <button onClick={() => addSuggestedActivity(activity)} style={styles.smallButton}>
                                            Añadir
                                        </button>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <aside style={styles.summary}>
                    <h2 style={styles.panelTitle}>Resumen</h2>
                    <div style={styles.summaryLine}>
                        <span>Plazas / actividades</span>
                        <strong>{totalItems}</strong>
                    </div>
                    <div style={styles.summaryLine}>
                        <span>Subtotal</span>
                        <strong>{subtotal.toFixed(2)} €</strong>
                    </div>
                    <div style={styles.summaryLine}>
                        <span>Gestión</span>
                        <strong>{managementFee.toFixed(2)} €</strong>
                    </div>
                    <div style={styles.totalLine}>
                        <span>Total estimado</span>
                        <strong>{total.toFixed(2)} €</strong>
                    </div>

                    <label style={styles.label}>
                        Nombre del grupo
                        <input
                            placeholder="Ej. Despedida de Juan"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            style={styles.input}
                        />
                    </label>

                    <label style={styles.label}>
                        Fecha prevista
                        <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            style={styles.input}
                        />
                    </label>

                    <label style={styles.label}>
                        Notas para el equipo
                        <textarea
                            placeholder="Horario, tamaño del grupo, preferencias..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={styles.textarea}
                        />
                    </label>

                    <button
                        onClick={handleOrder}
                        disabled={submitting || !groupName.trim()}
                        style={{
                            ...styles.primaryButton,
                            opacity: submitting || !groupName.trim() ? 0.65 : 1,
                            width: "100%",
                        }}
                    >
                        {submitting ? "Confirmando..." : "Confirmar reserva"}
                    </button>

                    {message && <p style={styles.message}>{message}</p>}
                </aside>
            </section>
        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        maxWidth: 1180,
        margin: "0 auto",
        padding: "2rem",
    },
    header: {
        alignItems: "end",
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        marginBottom: "1.5rem",
    },
    kicker: {
        color: "#be123c",
        display: "block",
        fontSize: "0.82rem",
        fontWeight: 800,
        marginBottom: "0.35rem",
        textTransform: "uppercase",
    },
    title: {
        color: "#1d1028",
        fontSize: "2.25rem",
        lineHeight: 1.1,
        margin: 0,
    },
    muted: {
        color: "#6b7280",
        lineHeight: 1.55,
        margin: "0.5rem 0 0",
    },
    layout: {
        alignItems: "start",
        display: "grid",
        gap: "1.5rem",
        gridTemplateColumns: "minmax(0, 1fr) 360px",
    },
    cartPanel: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    panelHeader: {
        alignItems: "center",
        background: "linear-gradient(90deg, #ffffff, #fff7ed)",
        border: "1px solid #fed7aa",
        borderRadius: 8,
        display: "flex",
        justifyContent: "space-between",
        padding: "1rem",
    },
    panelTitle: {
        color: "#1d1028",
        fontSize: "1.2rem",
        margin: 0,
    },
    itemList: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    item: {
        alignItems: "stretch",
        background: "#fff",
        border: "1px solid #fed7aa",
        borderRadius: 8,
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "120px minmax(0, 1fr) 170px",
        padding: "1rem",
    },
    itemThumb: {
        backgroundPosition: "center",
        backgroundSize: "cover",
        border: "none",
        borderRadius: 8,
        color: "#fff",
        cursor: "pointer",
        fontWeight: 800,
        minHeight: 100,
    },
    itemThumbLabel: {
        background: "rgba(255,255,255,0.9)",
        borderRadius: 999,
        color: "#9f1239",
        display: "inline-block",
        padding: "0.4rem 0.6rem",
    },
    itemInfo: {
        minWidth: 0,
    },
    itemTitle: {
        color: "#111827",
        fontSize: "1.1rem",
        margin: "0 0 0.35rem",
    },
    itemMeta: {
        color: "#be123c",
        display: "block",
        fontSize: "0.88rem",
        marginBottom: "0.5rem",
    },
    itemDescription: {
        color: "#4b5563",
        lineHeight: 1.45,
        margin: 0,
    },
    quantityBox: {
        alignItems: "end",
        display: "flex",
        flexDirection: "column",
        gap: "0.55rem",
    },
    price: {
        color: "#be123c",
        fontWeight: 800,
    },
    stepper: {
        border: "2px solid #fed7aa",
        borderRadius: 6,
        display: "flex",
        overflow: "hidden",
    },
    stepButton: {
        background: "#fff7ed",
        border: "none",
        cursor: "pointer",
        fontWeight: 800,
        minWidth: 34,
    },
    quantityInput: {
        border: "none",
        padding: "0.5rem",
        textAlign: "center",
        width: 54,
    },
    lineTotal: {
        color: "#111827",
        fontSize: "1.05rem",
    },
    removeButton: {
        background: "transparent",
        border: "none",
        color: "#b91c1c",
        cursor: "pointer",
        fontWeight: 700,
    },
    summary: {
        background: "linear-gradient(160deg, #1d1028, #4c1d95 52%, #be123c)",
        borderRadius: 8,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1.3rem",
        position: "sticky",
        top: 16,
    },
    summaryLine: {
        alignItems: "center",
        borderBottom: "1px solid rgba(253,230,138,0.2)",
        color: "#e0f2fe",
        display: "flex",
        justifyContent: "space-between",
        paddingBottom: "0.75rem",
    },
    totalLine: {
        alignItems: "center",
        color: "#fff",
        display: "flex",
        fontSize: "1.1rem",
        justifyContent: "space-between",
        paddingBottom: "0.5rem",
    },
    label: {
        color: "#d1d5db",
        display: "flex",
        flexDirection: "column",
        fontSize: "0.9rem",
        gap: "0.35rem",
    },
    input: {
        border: "2px solid #fed7aa",
        borderRadius: 10,
        padding: "0.85rem",
    },
    textarea: {
        border: "2px solid #fed7aa",
        borderRadius: 10,
        minHeight: 90,
        padding: "0.75rem",
    },
    primaryButton: {
        background: "linear-gradient(135deg, #ffbf00, #ff3e6c)",
        border: "none",
        borderRadius: 999,
        color: "#fff",
        cursor: "pointer",
        fontWeight: 800,
        padding: "0.85rem 1.1rem",
    },
    lightButton: {
        background: "#fff7ed",
        border: "1px solid #fed7aa",
        borderRadius: 999,
        color: "#c2410c",
        cursor: "pointer",
        fontWeight: 700,
        padding: "0.8rem 1rem",
    },
    dangerButton: {
        background: "#fee2e2",
        border: "1px solid #fecaca",
        borderRadius: 6,
        color: "#b91c1c",
        cursor: "pointer",
        fontWeight: 700,
        padding: "0.65rem 0.9rem",
    },
    suggestions: {
        background: "linear-gradient(180deg, #ffffff, #fff7ed)",
        border: "1px solid #fed7aa",
        borderRadius: 8,
        padding: "1rem",
    },
    suggestionGrid: {
        display: "grid",
        gap: "0.8rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        marginTop: "1rem",
    },
    suggestionCard: {
        border: "1px solid #fed7aa",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "0.9rem",
    },
    smallButton: {
        background: "#fff7ed",
        border: "1px solid #fed7aa",
        borderRadius: 6,
        color: "#9f1239",
        cursor: "pointer",
        fontWeight: 700,
        padding: "0.55rem 0.8rem",
    },
    message: {
        background: "rgba(255,255,255,0.1)",
        borderRadius: 6,
        color: "#fff",
        lineHeight: 1.4,
        margin: 0,
        padding: "0.7rem",
    },
    emptyState: {
        alignItems: "center",
        background: "linear-gradient(180deg, #ffffff, #fff7ed)",
        border: "1px solid #fed7aa",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "4rem 2rem",
        textAlign: "center",
    },
    emptyIcon: {
        background: "#fff1f2",
        borderRadius: "999px",
        color: "#be123c",
        fontWeight: 800,
        padding: "0.6rem 0.9rem",
    },
    emptyActions: {
        display: "flex",
        gap: "0.8rem",
    },
};

export default CheckoutPage;
