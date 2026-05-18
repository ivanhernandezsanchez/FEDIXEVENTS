import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Activity, City } from "../types";
import { addActivityToCart } from "../cart";
import { getActivityImage, getActivityVideo, renderStars } from "../visuals";

function Catalog() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [categoryVideos, setCategoryVideos] = useState<Record<string, string>>({});

  useEffect(() => {
    const key = import.meta.env.VITE_PIXABAY_KEY;
    if (!key || key === "TU_API_KEY_AQUI") return;

    const keywords: Record<string, string> = {
      Aventura: "karting go kart extreme sports",
      Gastro: "restaurant chef cooking food",
      Fiesta: "party nightclub dancing",
      Premium: "luxury spa pool relax",
      Ocio: "entertainment fun leisure",
    };

    const fetchVideos = async () => {
      const results: Record<string, string> = {};
      await Promise.all(
        Object.entries(keywords).map(async ([cat, q]) => {
          try {
            const res = await fetch(
              `https://pixabay.com/api/videos/?key=${key}&q=${encodeURIComponent(q)}&per_page=5&video_type=film`
            );
            const data = await res.json();
            const url = data.hits?.[0]?.videos?.small?.url;
            if (url) results[cat] = url;
          } catch {}
        })
      );
      setCategoryVideos(results);
    };

    fetchVideos();
  }, []);

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

  const isAIPlan = (activity: Activity) =>
    !activity.provider_id && (Number(activity.price) === 0 || activity.category?.toLowerCase().includes("ia") || activity.category?.toLowerCase().includes("personalizado"));

  const categories = Array.from(new Set(activities.map((activity) => activity.category))).filter(Boolean);
  const moods = ["Party", "Adventure", "Gastro", "Relax", "Premium"];
  const visibleActivities = activities.filter((activity) => {
    const categoryMatch = !selectedCategory || activity.category === selectedCategory;
    const moodMatch = !selectedMood || `${activity.category} ${activity.name}`.toLowerCase().includes(selectedMood.toLowerCase());
    return categoryMatch && moodMatch;
  });

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .catalog-container { padding: 1rem !important; }
        .catalog-hero {
          flex-direction: column !important;
          gap: 1.25rem !important;
          padding: 1.5rem !important;
        }
        .catalog-title { font-size: 2rem !important; }
        .catalog-filter-box { min-width: 0 !important; width: 100% !important; }
      }
      .activity-card:hover .activity-video {
        opacity: 1 !important;
      }
    `}</style>
    <main className="catalog-container" style={styles.container}>
      <section className="catalog-hero" style={styles.hero}>
        <div>
          <span style={styles.kicker}>Full catalogue</span>
          <h1 className="catalog-title" style={styles.title}>Catalogue</h1>
          <p style={styles.subtitle}>Filter by city, compare activities and build your cart in a few clicks.</p>
        </div>

        <div className="catalog-filter-box" style={styles.filterBox}>
          <label style={styles.filterLabel}>Destination</label>
          <select
            value={selectedCity}
            onChange={(event) => setSelectedCity(event.target.value)}
            style={styles.select}
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="catalog-trust" style={styles.trustBar}>
        <span>{activities.length} activities available</span>
        <span>Book from your cart</span>
        <span>Managed via intranet</span>
      </section>

      <section style={styles.filterChips}>
        <button className={!selectedCategory && !selectedMood ? "catalog-chip-active" : "catalog-chip"} onClick={() => { setSelectedCategory(""); setSelectedMood(""); }} style={!selectedCategory && !selectedMood ? styles.activeChip : styles.chip}>
          All
        </button>
        {categories.map((category) => (
          <button className={selectedCategory === category ? "catalog-chip-active" : "catalog-chip"} key={category} onClick={() => setSelectedCategory(category)} style={selectedCategory === category ? styles.activeChip : styles.chip}>
            {category}
          </button>
        ))}
        {moods.map((mood) => (
          <button className={selectedMood === mood ? "catalog-chip-active" : "catalog-chip"} key={mood} onClick={() => setSelectedMood(mood)} style={selectedMood === mood ? styles.activeChip : styles.chip}>
            {mood}
          </button>
        ))}
      </section>

      <div style={styles.grid}>
        {loading ? (
          <p style={styles.empty}>Loading catalogue...</p>
        ) : visibleActivities.length === 0 ? (
          <p style={styles.empty}>No activities available.</p>
        ) : (
          visibleActivities.map((activity) => {
            const aiPlan = isAIPlan(activity);
            return (
              <article
                key={activity.id}
                className="activity-card"
                style={styles.card}
                onMouseEnter={(e) => {
                  const video = e.currentTarget.querySelector("video");
                  if (video) video.play().catch(() => {});
                }}
                onMouseLeave={(e) => {
                  const video = e.currentTarget.querySelector("video");
                  if (video) { video.pause(); video.currentTime = 0; }
                }}
              >
                <button
                  onClick={() => navigate(`/activity/${activity.id}`)}
                  style={{
                    ...styles.imageButton,
                    backgroundImage: `linear-gradient(180deg, rgba(29,16,40,0.1), rgba(29,16,40,0.72)), url('${getActivityImage(activity)}')`,
                    position: "relative",
                  }}
                >
                  <video
                    className="activity-video"
                    src={categoryVideos[activity.category] ?? getActivityVideo(activity)}
                    muted
                    loop
                    playsInline
                    preload="none"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: 0,
                      transition: "opacity 0.4s ease",
                      borderRadius: 8,
                    }}
                  />
                  <span style={{ ...styles.imageLabel, position: "relative", zIndex: 1 }}>
                    {aiPlan ? "AI Plan" : "View details"}
                  </span>
                </button>
                <h2 style={styles.cardTitle}>{activity.name}</h2>
                <div className="card-rating" style={styles.ratingRow}>
                  <span style={styles.stars}>{renderStars(activity.avgRating)}</span>
                  <span>{Number(activity.avgRating) > 0 ? `${Number(activity.avgRating).toFixed(1)} / 5` : "No ratings"}</span>
                </div>
                <p className="card-meta" style={styles.meta}>{activity.category}{activity.provider_name ? ` · ${activity.provider_name}` : ""}</p>
                <p className="card-desc" style={styles.description}>{activity.description}</p>
                <div className="card-footer" style={styles.footer}>
                  <strong style={{ color: aiPlan ? "#c4b5fd" : "#F97316" }}>
                    {aiPlan ? "To review" : `${Number(activity.price).toFixed(2)} €`}
                  </strong>
                  <button
                    onClick={() => {
                      addActivityToCart(activity);
                      navigate("/cart");
                    }}
                    style={styles.button}
                  >
                    Add
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </main>
    </>
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
    background: "linear-gradient(135deg, #0D0920, #2E1065 52%, #DB2777 120%)",
    border: "1px solid rgba(168, 85, 247, 0.25)",
    borderRadius: 12,
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "1.5rem",
    padding: "2.4rem",
  },
  kicker: {
    color: "#A855F7",
    display: "block",
    fontSize: "0.82rem",
    fontWeight: 800,
    marginBottom: "0.45rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  title: {
    color: "#fff",
    fontFamily: "Arial Black, Trebuchet MS, Arial, sans-serif",
    fontSize: "3rem",
    margin: 0,
  },
  subtitle: {
    color: "#c4b5fd",
    margin: "0.5rem 0 0",
    maxWidth: 620,
  },
  filterBox: {
    background: "rgba(30, 27, 75, 0.7)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(168, 85, 247, 0.35)",
    borderRadius: 10,
    minWidth: 260,
    padding: "1.25rem",
  },
  filterLabel: {
    color: "#A855F7",
    display: "block",
    fontSize: "0.82rem",
    fontWeight: 800,
    marginBottom: "0.4rem",
    textTransform: "uppercase",
  },
  select: {
    border: "1px solid rgba(168, 85, 247, 0.4)",
    borderRadius: 8,
    minWidth: "100%",
    padding: "0.9rem",
    background: "rgba(13, 9, 32, 0.7)",
    color: "#F3F4F6",
  },
  trustBar: {
    background: "rgba(30, 27, 75, 0.4)",
    border: "1px solid rgba(168, 85, 247, 0.2)",
    borderRadius: 8,
    color: "#c4b5fd",
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
    background: "transparent",
    border: "1px solid rgba(168, 85, 247, 0.35)",
    borderRadius: 999,
    color: "#c4b5fd",
    cursor: "pointer",
    fontWeight: 900,
    padding: "0.75rem 1rem",
  },
  activeChip: {
    background: "linear-gradient(135deg, #A855F7, #DB2777)",
    border: "1px solid transparent",
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
    background: "rgba(30, 27, 75, 0.55)",
    border: "1px solid rgba(168, 85, 247, 0.2)",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: "0.7rem",
    boxShadow: "0 16px 34px rgba(46, 16, 101, 0.25)",
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
    background: "rgba(168, 85, 247, 0.8)",
    backdropFilter: "blur(4px)",
    borderRadius: 999,
    color: "#fff",
    display: "inline-block",
    padding: "0.45rem 0.7rem",
  },
  cardTitle: {
    color: "#F3F4F6",
    fontSize: "1.25rem",
    fontWeight: 900,
    margin: 0,
  },
  ratingRow: {
    alignItems: "center",
    color: "#9ca3af",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.88rem",
    gap: "0.45rem",
  },
  stars: {
    color: "#F97316",
    fontSize: "1rem",
    letterSpacing: "0.03em",
  },
  meta: {
    color: "#A855F7",
    fontSize: "0.9rem",
    margin: 0,
  },
  description: {
    color: "#9ca3af",
    flex: 1,
    lineHeight: 1.45,
    margin: 0,
  },
  footer: {
    alignItems: "center",
    borderTop: "1px solid rgba(168, 85, 247, 0.15)",
    color: "#F97316",
    fontWeight: 700,
    fontSize: "1.1rem",
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "1rem",
  },
  button: {
    background: "linear-gradient(135deg, #DB2777, #F97316)",
    border: "none",
    borderRadius: 999,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    padding: "0.8rem 1.1rem",
    boxShadow: "0 6px 16px rgba(249, 115, 22, 0.3)",
  },
  empty: {
    color: "#6b7280",
    gridColumn: "1 / -1",
    padding: "2rem",
    textAlign: "center",
  },
};

export default Catalog;
