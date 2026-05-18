import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Activity } from "../types";
import { addActivityToCart } from "../cart";
import { getActivityImage, renderStars } from "../visuals";

const mobileCss = `
  @media (max-width: 768px) {
    .pd-page { padding: 1rem 1rem 6rem !important; }
    .pd-hero {
      grid-template-columns: 1fr !important;
    }
    .pd-image-panel { min-height: 220px !important; border-radius: 10px !important; }
    .pd-booking-panel { padding: 1.1rem !important; gap: 0.75rem !important; }
    .pd-title { font-size: 1.65rem !important; }
    .pd-price-box { font-size: 1.1rem !important; padding: 0.75rem !important; }
    .pd-primary-btn { width: 100% !important; text-align: center !important; }
    .pd-quick-facts { grid-template-columns: 1fr 1fr !important; gap: 0.6rem !important; }
    .pd-content-grid { grid-template-columns: 1fr !important; }
    .pd-include-grid { grid-template-columns: 1fr !important; gap: 0.55rem !important; }
    .pd-review-form { position: static !important; }
    .pd-sticky-cta {
      flex-direction: column !important;
      align-items: stretch !important;
      border-radius: 16px !important;
      gap: 0.5rem !important;
      padding: 0.85rem 1rem !important;
      text-align: center !important;
    }
    .pd-sticky-cta strong { font-size: 0.95rem !important; }
  }
`;

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
                <h1>Activity not found</h1>
                <p>The activity you're looking for doesn't exist or has been removed.</p>
                <button onClick={() => navigate("/catalog")} style={styles.primaryButton}>Back to catalog</button>
            </main>
        );
    }

    if (!idNumber) return <p style={{ padding: 20 }}>Invalid ID</p>;
    if (!activity) return <p style={{ padding: 20 }}>Loading...</p>;

    return (
        <main className="pd-page" style={styles.page}>
            <style>{mobileCss}</style>
            <button onClick={() => navigate(-1)} style={styles.backButton}>← Back</button>

            <section className="pd-hero" style={styles.hero}>
                <div className="pd-image-panel" style={{ ...styles.imagePanel, backgroundImage: `linear-gradient(180deg, rgba(13,9,32,0.08), rgba(46,16,101,0.7)), url('${getActivityImage(activity)}')` }}>
                    <span style={styles.categoryBadge}>{activity.category}</span>
                </div>

                <aside className="pd-booking-panel" style={styles.bookingPanel}>
                    <span style={styles.kicker}>Featured plan</span>
                    <h1 className="pd-title" style={styles.title}>{activity.name}</h1>
                    <p style={styles.description}>{activity.description}</p>
                    <div style={styles.ratingRow}>
                        <span style={styles.stars}>{renderStars(activity.avgRating)}</span>
                        <strong>{Number(activity.avgRating) > 0 ? `${Number(activity.avgRating).toFixed(1)} / 5` : "No reviews"}</strong>
                    </div>
                    <div className="pd-price-box" style={styles.priceBox}>
                        <span>From</span>
                        <strong>{Number(activity.price).toFixed(2)} €</strong>
                    </div>
                    <button className="pd-primary-btn" onClick={addToSelection} style={styles.primaryButton}>Add to cart</button>
                </aside>
            </section>

            <section className="pd-quick-facts" style={styles.quickFacts}>
                <article style={styles.fact}><strong>Duration</strong><span>{activity.duration_minutes ? `${activity.duration_minutes} min` : "Flexible"}</span></article>
                <article style={styles.fact}><strong>Group</strong><span>{activity.max_capacity ? `Up to ${activity.max_capacity}` : "Open group"}</span></article>
                <article style={styles.fact}><strong>Provider</strong><span>{activity.provider_name || "Fedi Team"}</span></article>
                <article style={styles.fact}><strong>Includes</strong><span>Plan, coordination and booking</span></article>
            </section>

            <section className="pd-content-grid" style={styles.contentGrid}>
                <div>
                    <h2 style={styles.sectionTitle}>What's included</h2>
                    <div className="pd-include-grid" style={styles.includeGrid}>
                        {["Main activity", "Estimated timings", "Group customisation", "Add to cart"].map((item) => (
                            <span key={item} style={styles.includeItem}>✓ {item}</span>
                        ))}
                    </div>

                    <h2 style={styles.sectionTitle}>Reviews</h2>
                    <div style={styles.reviewList}>
                        {reviews.length === 0 ? (
                            <p style={styles.muted}>No reviews yet. Be the first to leave one.</p>
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

                <aside className="pd-review-form" style={styles.reviewForm}>
                    <h2 style={styles.sectionTitle}>Write a review</h2>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={styles.input}>
                        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} {n === 1 ? "star" : "stars"}</option>)}
                    </select>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us how it went..." style={styles.textarea} />
                    <button onClick={sendReview} style={styles.secondaryButton}>Submit review</button>
                </aside>
            </section>

            <div className="pd-sticky-cta" style={styles.stickyCta}>
                <strong>{activity.name}</strong>
                <button className="pd-primary-btn" onClick={addToSelection} style={styles.primaryButton}>Add for {Number(activity.price).toFixed(2)} €</button>
            </div>
        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: 1180, margin: "0 auto", padding: "2rem 2rem 7rem" },
    centerState: { minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center", padding: "2rem", color: "#F3F4F6" },
    backButton: { background: "transparent", border: "1px solid rgba(168, 85, 247, 0.4)", borderRadius: 999, color: "#c4b5fd", cursor: "pointer", fontWeight: 900, marginBottom: "1rem", padding: "0.8rem 1rem" },
    hero: { display: "grid", gap: "1.5rem", gridTemplateColumns: "minmax(0, 1.4fr) 380px", alignItems: "stretch" },
    imagePanel: { minHeight: 520, backgroundPosition: "center", backgroundSize: "cover", borderRadius: 12, padding: "1.2rem", display: "flex", alignItems: "start", border: "1px solid rgba(168, 85, 247, 0.2)" },
    categoryBadge: { background: "rgba(168, 85, 247, 0.8)", backdropFilter: "blur(4px)", borderRadius: 999, color: "#fff", fontWeight: 900, padding: "0.55rem 0.8rem" },
    bookingPanel: { background: "rgba(30, 27, 75, 0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(168, 85, 247, 0.25)", borderRadius: 12, boxShadow: "0 22px 48px rgba(46, 16, 101, 0.3)", display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" },
    kicker: { color: "#A855F7", fontSize: "0.82rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em" },
    title: { color: "#F3F4F6", fontSize: "2.4rem", lineHeight: 1.05, margin: 0 },
    description: { color: "#9ca3af", lineHeight: 1.6, margin: 0 },
    ratingRow: { display: "flex", alignItems: "center", gap: "0.65rem", color: "#9ca3af" },
    stars: { color: "#F97316", letterSpacing: "0.03em" },
    priceBox: { background: "rgba(249, 115, 22, 0.1)", border: "1px solid rgba(249, 115, 22, 0.3)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", color: "#F97316", fontWeight: 700, fontSize: "1.3rem" },
    primaryButton: { background: "linear-gradient(135deg, #DB2777, #F97316)", border: "none", borderRadius: 999, color: "#fff", cursor: "pointer", fontWeight: 900, padding: "1rem 1.25rem", boxShadow: "0 8px 20px rgba(249, 115, 22, 0.3)" },
    quickFacts: { display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", margin: "1.5rem 0" },
    fact: { background: "rgba(30, 27, 75, 0.5)", border: "1px solid rgba(168, 85, 247, 0.2)", borderRadius: 8, display: "grid", gap: "0.35rem", padding: "1rem", color: "#c4b5fd" },
    contentGrid: { display: "grid", gap: "1.5rem", gridTemplateColumns: "minmax(0, 1fr) 340px" },
    sectionTitle: { color: "#F3F4F6", margin: "0 0 1rem" },
    includeGrid: { display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: "2rem" },
    includeItem: { background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: 8, color: "#e9d5ff", fontWeight: 900, padding: "0.85rem" },
    reviewList: { display: "grid", gap: "0.85rem" },
    reviewCard: { background: "rgba(30, 27, 75, 0.5)", border: "1px solid rgba(168, 85, 247, 0.2)", borderRadius: 8, padding: "1rem", color: "#c4b5fd" },
    reviewTop: { display: "flex", justifyContent: "space-between", gap: "1rem", color: "#F3F4F6", marginBottom: "0.5rem" },
    muted: { color: "#6b7280" },
    reviewForm: { background: "rgba(30, 27, 75, 0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(168, 85, 247, 0.25)", borderRadius: 8, display: "flex", flexDirection: "column", gap: "0.8rem", padding: "1.2rem", position: "sticky", top: 20 },
    input: { border: "1px solid rgba(168, 85, 247, 0.4)", borderRadius: 8, padding: "0.85rem", background: "rgba(13, 9, 32, 0.6)", color: "#F3F4F6" },
    textarea: { border: "1px solid rgba(168, 85, 247, 0.4)", borderRadius: 8, minHeight: 140, padding: "0.85rem", background: "rgba(13, 9, 32, 0.6)", color: "#F3F4F6" },
    secondaryButton: { background: "linear-gradient(135deg, #A855F7, #DB2777)", border: "none", borderRadius: 999, color: "#fff", cursor: "pointer", fontWeight: 900, padding: "0.9rem 1rem" },
    stickyCta: { alignItems: "center", background: "rgba(13, 9, 32, 0.92)", backdropFilter: "blur(12px)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: 999, bottom: 18, boxShadow: "0 18px 40px rgba(46, 16, 101, 0.4)", color: "#fff", display: "flex", gap: "1rem", justifyContent: "space-between", left: "50%", maxWidth: 760, padding: "0.65rem 0.75rem 0.65rem 1.2rem", position: "fixed", transform: "translateX(-50%)", width: "calc(100% - 2rem)", zIndex: 35 },
};

export default ProductDetail;
