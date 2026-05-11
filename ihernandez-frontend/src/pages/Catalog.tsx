import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Activity, City } from "../types";
import { addActivityToCart } from "../cart";
import { getActivityImage, renderStars } from "../visuals";

function Catalog() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMood, setSelectedMood] = useState("");

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = selectedCity ? `?city_id=${selectedCity}` : "";

    fetch(`/api/activities${query}`)
      .then((res) => res.json())
      .then((data) => setActivities(Array.isArray(data) ? data : []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [selectedCity]);

  const categories = Array.from(new Set(activities.map((activity) => activity.category))).filter(Boolean);
  const moods = ["Fiesta", "Aventura", "Gastro", "Relax", "Premium"];
  const visibleActivities = activities.filter((activity) => {
    const categoryMatch = !selectedCategory || activity.category === selectedCategory;
    const moodMatch = !selectedMood || `${activity.category} ${activity.name}`.toLowerCase().includes(selectedMood.toLowerCase());
    return categoryMatch && moodMatch;
  });

  return (
    <main style={styles.container}>
      <section style={styles.hero}>
        <div>
          <span style={styles.kicker}>Catálogo completo</span>
          <h1 style={styles.title}>Catálogo</h1>
          <p style={styles.subtitle}>Filtra por ciudad, compara actividades y monta el carrito de la despedida en pocos clics.</p>
        </div>

        <div style={styles.filterBox}>
          <label style={styles.filterLabel}>Destino</label>
          <select
            value={selectedCity}
            onChange={(event) => setSelectedCity(event.target.value)}
            style={styles.select}
          >
            <option value="">Todas las ciudades</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section style={styles.trustBar}>
        <span>{activities.length} actividades disponibles</span>
        <span>Reserva desde carrito</span>
        <span>Gestión desde intranet</span>
      </section>

      <section style={styles.filterChips}>
        <button onClick={() => { setSelectedCategory(""); setSelectedMood(""); }} style={!selectedCategory && !selectedMood ? styles.activeChip : styles.chip}>
          Todo
        </button>
        {categories.map((category) => (
          <button key={category} onClick={() => setSelectedCategory(category)} style={selectedCategory === category ? styles.activeChip : styles.chip}>
            {category}
          </button>
        ))}
        {moods.map((mood) => (
          <button key={mood} onClick={() => setSelectedMood(mood)} style={selectedMood === mood ? styles.activeChip : styles.chip}>
            {mood}
          </button>
        ))}
      </section>

      <div style={styles.grid}>
        {loading ? (
          <p style={styles.empty}>Cargando catálogo...</p>
        ) : visibleActivities.length === 0 ? (
          <p style={styles.empty}>No hay productos disponibles.</p>
        ) : (
          visibleActivities.map((activity) => (
            <article key={activity.id} style={styles.card}>
              <button
                onClick={() => navigate(`/activity/${activity.id}`)}
                style={{
                  ...styles.imageButton,
                  backgroundImage: `linear-gradient(180deg, rgba(29,16,40,0.1), rgba(29,16,40,0.72)), url('${getActivityImage(activity)}')`,
                }}
              >
                <span style={styles.imageLabel}>Ver detalle</span>
              </button>
              <h2 style={styles.cardTitle}>{activity.name}</h2>
              <div style={styles.ratingRow}>
                <span style={styles.stars}>{renderStars(activity.avgRating)}</span>
                <span>{Number(activity.avgRating) > 0 ? `${Number(activity.avgRating).toFixed(1)} / 5` : "Sin reseñas todavía"}</span>
              </div>
              <p style={styles.meta}>{activity.category}{activity.provider_name ? ` · ${activity.provider_name}` : ""}</p>
              <p style={styles.description}>{activity.description}</p>
              <div style={styles.footer}>
                <strong>{Number(activity.price).toFixed(2)} €</strong>
                <button
                  onClick={() => {
                    addActivityToCart(activity);
                    navigate("/cart");
                  }}
                  style={styles.button}
                >
                  Añadir
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "2rem",
  },
  hero: {
    alignItems: "center",
    background: "linear-gradient(135deg, #1d1028, #4c1d95 52%, #be123c)",
    borderRadius: 8,
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "1.5rem",
    padding: "2.4rem",
  },
  kicker: {
    color: "#fde68a",
    display: "block",
    fontSize: "0.82rem",
    fontWeight: 800,
    marginBottom: "0.45rem",
    textTransform: "uppercase",
  },
  title: {
    color: "#fff",
    fontFamily: "Arial Black, Trebuchet MS, Arial, sans-serif",
    fontSize: "3rem",
    margin: 0,
  },
  subtitle: {
    color: "#e0f2fe",
    margin: "0.5rem 0 0",
    maxWidth: 620,
  },
  filterBox: {
    background: "linear-gradient(180deg, #fff, #fff7ed)",
    border: "1px solid #fbbf24",
    borderRadius: 8,
    minWidth: 260,
    padding: "1.25rem",
  },
  filterLabel: {
    color: "#be123c",
    display: "block",
    fontSize: "0.82rem",
    fontWeight: 800,
    marginBottom: "0.4rem",
  },
  select: {
    border: "2px solid #fbbf24",
    borderRadius: 8,
    minWidth: "100%",
    padding: "0.9rem",
  },
  trustBar: {
    background: "linear-gradient(90deg, #fff7ed, #fff1f2)",
    border: "1px solid #fed7aa",
    borderRadius: 8,
    color: "#172033",
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    fontWeight: 800,
    padding: "1.15rem 1.3rem",
  },
  filterChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  },
  chip: {
    background: "#fff",
    border: "2px solid #fed7aa",
    borderRadius: 999,
    color: "#9f1239",
    cursor: "pointer",
    fontWeight: 900,
    padding: "0.75rem 1rem",
  },
  activeChip: {
    background: "linear-gradient(135deg, #ffbf00, #ff3e6c)",
    border: "2px solid transparent",
    borderRadius: 999,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    padding: "0.75rem 1rem",
  },
  grid: {
    display: "grid",
    gap: "1.35rem",
    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
  },
  card: {
    background: "#fff",
    border: "1px solid #fed7aa",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: "0.7rem",
    boxShadow: "0 16px 34px rgba(76, 29, 149, 0.12)",
    padding: "1.15rem",
  },
  imageButton: {
    aspectRatio: "16 / 9",
    backgroundPosition: "center",
    backgroundSize: "cover",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 900,
    overflow: "hidden",
    padding: "1rem",
    textAlign: "left",
  },
  imageLabel: {
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: 999,
    color: "#9f1239",
    display: "inline-block",
    padding: "0.45rem 0.7rem",
  },
  cardTitle: {
    color: "#1d1028",
    fontSize: "1.25rem",
    fontWeight: 900,
    margin: 0,
  },
  ratingRow: {
    alignItems: "center",
    color: "#64748b",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.88rem",
    gap: "0.45rem",
  },
  stars: {
    color: "#f59e0b",
    fontSize: "1rem",
    letterSpacing: "0.03em",
  },
  meta: {
    color: "#be123c",
    fontSize: "0.9rem",
    margin: 0,
  },
  description: {
    color: "#4b5563",
    flex: 1,
    lineHeight: 1.45,
    margin: 0,
  },
  footer: {
    alignItems: "center",
    borderTop: "1px solid #fed7aa",
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "1rem",
  },
  button: {
    background: "linear-gradient(135deg, #ffbf00, #ff3e6c)",
    border: "none",
    borderRadius: 999,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    padding: "0.8rem 1.1rem",
  },
  empty: {
    color: "#6b7280",
    gridColumn: "1 / -1",
    padding: "2rem",
    textAlign: "center",
  },
};

export default Catalog;
