import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Activity } from "../types";
import { addActivityToCart } from "../cart";
import { getActivityImage, renderStars } from "../visuals";

interface Review {
    id: number;
    rating: number;
    comment: string;
    customer: string;
}

interface ProductDetailProps {
    addToCart?: (activity: Activity) => void;
}

function ProductDetail({ addToCart }: ProductDetailProps) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const idNumber = id ? Number(id) : null;

    const [activity, setActivity] = useState<Activity | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [notFound, setNotFound] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (!idNumber) return;

        fetch(`/api/activities/${idNumber}`)
            .then(async (res) => {
                if (res.status === 404) {
                    setNotFound(true);
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (data) setActivity(data);
            })
            .catch(console.error);

        fetch(`/api/activities/${idNumber}/reviews`)
            .then((r) => r.json())
            .then(setReviews)
            .catch(console.error);
    }, [idNumber]);

    const sendReview = async () => {
        if (!idNumber || !comment.trim()) return;

        await fetch(`/api/activities/${idNumber}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating, comment, customerId: 1 }),
        });

        setComment("");
        setRating(5);
        const res = await fetch(`/api/activities/${idNumber}/reviews`);
        setReviews(await res.json());
    };

    const addToSelection = () => {
        if (!activity) return;
        addToCart?.(activity);
        addActivityToCart(activity);
        navigate("/cart");
    };

    if (notFound) {
        return (
            <main style={styles.centerState}>
                <h1>Actividad no encontrada</h1>
                <p>La actividad que buscas no existe o ha sido eliminada.</p>
                <button onClick={() => navigate("/catalog")} style={styles.primaryButton}>Volver al catálogo</button>
            </main>
        );
    }

    if (!idNumber) return <p style={{ padding: 20 }}>ID inválido</p>;
    if (!activity) return <p style={{ padding: 20 }}>Cargando...</p>;

    return (
        <main style={styles.page}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>← Volver</button>

            <section style={styles.hero}>
                <div style={{ ...styles.imagePanel, backgroundImage: `linear-gradient(180deg, rgba(29,16,40,0.06), rgba(29,16,40,0.76)), url('${getActivityImage(activity)}')` }}>
                    <span style={styles.categoryBadge}>{activity.category}</span>
                </div>

                <aside style={styles.bookingPanel}>
                    <span style={styles.kicker}>Plan destacado</span>
                    <h1 style={styles.title}>{activity.name}</h1>
                    <p style={styles.description}>{activity.description}</p>
                    <div style={styles.ratingRow}>
                        <span style={styles.stars}>{renderStars(activity.avgRating)}</span>
                        <strong>{Number(activity.avgRating) > 0 ? `${Number(activity.avgRating).toFixed(1)} / 5` : "Sin reseñas"}</strong>
                    </div>
                    <div style={styles.priceBox}>
                        <span>Desde</span>
                        <strong>{Number(activity.price).toFixed(2)} €</strong>
                    </div>
                    <button onClick={addToSelection} style={styles.primaryButton}>Añadir al carrito</button>
                </aside>
            </section>

            <section style={styles.quickFacts}>
                <article style={styles.fact}><strong>Duración</strong><span>{activity.duration_minutes ? `${activity.duration_minutes} min` : "Flexible"}</span></article>
                <article style={styles.fact}><strong>Grupo</strong><span>{activity.max_capacity ? `Hasta ${activity.max_capacity}` : "Grupo abierto"}</span></article>
                <article style={styles.fact}><strong>Proveedor</strong><span>{activity.provider_name || "Equipo Fedi"}</span></article>
                <article style={styles.fact}><strong>Incluye</strong><span>Plan, coordinación y reserva</span></article>
            </section>

            <section style={styles.contentGrid}>
                <div>
                    <h2 style={styles.sectionTitle}>Qué incluye este plan</h2>
                    <div style={styles.includeGrid}>
                        {["Actividad principal", "Horarios orientativos", "Adaptación al grupo", "Añadible al carrito"].map((item) => (
                            <span key={item} style={styles.includeItem}>✓ {item}</span>
                        ))}
                    </div>

                    <h2 style={styles.sectionTitle}>Reseñas</h2>
                    <div style={styles.reviewList}>
                        {reviews.length === 0 ? (
                            <p style={styles.muted}>Todavía no hay reseñas. Puedes ser el primero en dejar una.</p>
                        ) : (
                            reviews.map((review) => (
                                <article key={review.id} style={styles.reviewCard}>
                                    <div style={styles.reviewTop}>
                                        <strong>{review.customer}</strong>
                                        <span style={styles.stars}>{renderStars(review.rating)}</span>
                                    </div>
                                    <p>{review.comment}</p>
                                </article>
                            ))
                        )}
                    </div>
                </div>

                <aside style={styles.reviewForm}>
                    <h2 style={styles.sectionTitle}>Escribir reseña</h2>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={styles.input}>
                        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} estrellas</option>)}
                    </select>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Cuenta qué tal fue el plan..." style={styles.textarea} />
                    <button onClick={sendReview} style={styles.secondaryButton}>Enviar reseña</button>
                </aside>
            </section>

            <div style={styles.stickyCta}>
                <strong>{activity.name}</strong>
                <button onClick={addToSelection} style={styles.primaryButton}>Añadir por {Number(activity.price).toFixed(2)} €</button>
            </div>
        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: 1180, margin: "0 auto", padding: "2rem 2rem 7rem" },
    centerState: { minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center", padding: "2rem" },
    backButton: { background: "#fff7ed", border: "2px solid #fed7aa", borderRadius: 999, color: "#9f1239", cursor: "pointer", fontWeight: 900, marginBottom: "1rem", padding: "0.8rem 1rem" },
    hero: { display: "grid", gap: "1.5rem", gridTemplateColumns: "minmax(0, 1.4fr) 380px", alignItems: "stretch" },
    imagePanel: { minHeight: 520, backgroundPosition: "center", backgroundSize: "cover", borderRadius: 8, padding: "1.2rem", display: "flex", alignItems: "start" },
    categoryBadge: { background: "#fff", borderRadius: 999, color: "#9f1239", fontWeight: 900, padding: "0.55rem 0.8rem" },
    bookingPanel: { background: "linear-gradient(180deg, #fff, #fff7ed)", border: "1px solid #fed7aa", borderRadius: 8, boxShadow: "0 22px 48px rgba(76,29,149,0.14)", display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" },
    kicker: { color: "#be123c", fontSize: "0.82rem", fontWeight: 900, textTransform: "uppercase" },
    title: { color: "#1d1028", fontSize: "2.4rem", lineHeight: 1.05, margin: 0 },
    description: { color: "#5b4a5f", lineHeight: 1.6, margin: 0 },
    ratingRow: { display: "flex", alignItems: "center", gap: "0.65rem", color: "#5b4a5f" },
    stars: { color: "#f59e0b", letterSpacing: "0.03em" },
    priceBox: { background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem" },
    primaryButton: { background: "linear-gradient(135deg, #ffbf00, #ff3e6c)", border: "none", borderRadius: 999, color: "#fff", cursor: "pointer", fontWeight: 900, padding: "1rem 1.25rem" },
    quickFacts: { display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", margin: "1.5rem 0" },
    fact: { background: "#fff", border: "1px solid #fed7aa", borderRadius: 8, display: "grid", gap: "0.35rem", padding: "1rem" },
    contentGrid: { display: "grid", gap: "1.5rem", gridTemplateColumns: "minmax(0, 1fr) 340px" },
    sectionTitle: { color: "#1d1028", margin: "0 0 1rem" },
    includeGrid: { display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: "2rem" },
    includeItem: { background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, color: "#9f1239", fontWeight: 900, padding: "0.85rem" },
    reviewList: { display: "grid", gap: "0.85rem" },
    reviewCard: { background: "#fff", border: "1px solid #fed7aa", borderRadius: 8, padding: "1rem" },
    reviewTop: { display: "flex", justifyContent: "space-between", gap: "1rem" },
    muted: { color: "#6b556b" },
    reviewForm: { background: "linear-gradient(180deg, #fff, #fff7ed)", border: "1px solid #fed7aa", borderRadius: 8, display: "flex", flexDirection: "column", gap: "0.8rem", padding: "1.2rem", position: "sticky", top: 20 },
    input: { border: "2px solid #fed7aa", borderRadius: 8, padding: "0.85rem" },
    textarea: { border: "2px solid #fed7aa", borderRadius: 8, minHeight: 140, padding: "0.85rem" },
    secondaryButton: { background: "#4c1d95", border: "none", borderRadius: 999, color: "#fff", cursor: "pointer", fontWeight: 900, padding: "0.9rem 1rem" },
    stickyCta: { alignItems: "center", background: "rgba(29,16,40,0.94)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, bottom: 18, boxShadow: "0 18px 40px rgba(29,16,40,0.28)", color: "#fff", display: "flex", gap: "1rem", justifyContent: "space-between", left: "50%", maxWidth: 760, padding: "0.65rem 0.75rem 0.65rem 1.2rem", position: "fixed", transform: "translateX(-50%)", width: "calc(100% - 2rem)", zIndex: 35 },
};

export default ProductDetail;
