import { useEffect, useState } from "react";
import type { City, Activity } from "../types";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import { addActivityToCart, addCustomPlanToCart } from "../cart";
import { getActivityImage, renderStars } from "../visuals";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type CommunityIdea = {
  id: number;
  suggested_name: string;
  description: string;
  category: string;
  suggested_price: number | string;
  max_capacity?: number | null;
  duration_minutes?: number | null;
  created_activity_id: number;
  city_name?: string | null;
  city_country?: string | null;
  price: number | string;
  city_id?: number | null;
};

const siteReviews = [
  {
    name: "Carlos M.",
    city: "Madrid",
    rating: 5,
    text: "En una tarde cerramos actividades, presupuesto y carrito. El grupo llegó con todo claro y sin discusiones eternas.",
  },
  {
    name: "Lucía R.",
    city: "Valencia",
    rating: 5,
    text: "Fedi nos propuso un plan mixto con comida, sorpresa y noche. Parecía hecho por alguien que conocía al grupo.",
  },
  {
    name: "Andrés P.",
    city: "Sevilla",
    rating: 4,
    text: "Muy cómodo para comparar opciones y guardar ideas. Las reseñas de actividades ayudaron bastante a decidir.",
  },
];

function Home() {
  const { user } = useUser();
  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Soy Fedi. Dime cuántos sois, qué rollo buscáis y presupuesto aproximado; mezclo catálogo, ideas a medida y carrito en un plan listo para reservar.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatCartMessage, setChatCartMessage] = useState("");
  const [footerVisible, setFooterVisible] = useState(false);
  const [fediOpen, setFediOpen] = useState(false);
  const [publishName, setPublishName] = useState("");
  const [publishMessage, setPublishMessage] = useState("");
  const [communityIdeas, setCommunityIdeas] = useState<CommunityIdea[]>([]);
  const navigate = useNavigate();

  // Load cities
  useEffect(() => {
    setLoading(true);
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data: City[]) => {
        setCities(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedCity(data[0].id);
        }
      })
      .catch((err) => {
        console.error("Error loading cities:", err);
        setCities([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/community-ideas")
      .then((res) => res.json())
      .then((data: CommunityIdea[]) => setCommunityIdeas(Array.isArray(data) ? data : []))
      .catch(() => setCommunityIdeas([]));
  }, []);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  // Load activities when city changes
  useEffect(() => {
    if (!selectedCity) return;

    setLoading(true);
    fetch(`/api/activities?city_id=${selectedCity}`)
      .then((res) => res.json())
      .then((data: Activity[]) => {
        setActivities(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error loading activities:", err);
        setActivities([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCity]);

  const handleActivityClick = (id: number) => {
    navigate(`/activity/${id}`);
  };

  const handleCreateGroup = () => {
    if (!user) {
      navigate("/intranet/login");
      return;
    }
    navigate("/catalog");
  };

  const sendChatMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || chatLoading) return;

    const nextMessages: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content: message },
    ];

    setChatMessages(nextMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: chatMessages,
          context: {
            selectedCityId: selectedCity,
            selectedCityName,
            activities: activities.slice(0, 8).map((activity) => ({
              id: activity.id,
              name: activity.name,
              category: activity.category,
              price: activity.price,
              duration_minutes: activity.duration_minutes,
              max_capacity: activity.max_capacity,
            })),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not generate a reply");
      }

      setChatMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error("Error en el chat IA:", error);
      setChatMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: error instanceof Error
            ? error.message
            : "I couldn't reply right now. Check that the backend is running and the AI key is configured.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendChatMessage(chatInput);
  };

  const extractLastNumber = (pattern: RegExp, fallback: number) => {
    const conversation = chatMessages.map((item) => item.content).join(" ");
    const matches = [...conversation.matchAll(pattern)];
    const lastMatch = matches.at(-1);
    const value = Number(lastMatch?.[1] ?? lastMatch?.[2]);

    return Number.isFinite(value) && value > 0 ? value : fallback;
  };

  const handleAddAiPlanToCart = () => {
    const conversation = chatMessages.map((item) => item.content).join(" ");
    const lastAssistantPlan = [...chatMessages].reverse().find((item) => item.role === "assistant")?.content ?? "";
    const budgetPerPerson = extractLastNumber(/(\d{1,4})\s*(?:€|euros?)/gi, 0);
    const unlimitedBudget = /unlimited\s+budget|no\s+limit|whatever\s+it\s+takes|premium|price\s+on\s+request|presupuesto\s+ilimitado|sin\s+l[ií]mite|lo\s+que\s+haga\s+falta|a\s+consultar/i.test(conversation);
    const people = extractLastNumber(/(?:we are|for|group of|somos|para|grupo de)\s*(\d{1,3})|(\d{1,3})\s*(?:people|friends|personas|amigos|amigas)/gi, 1);

    const customPlan: Activity = {
      id: -Date.now(),
      name: `Plan IA en ${selectedCityName}`,
      category: "Plan personalizado IA",
      description: lastAssistantPlan || "Plan personalizado acordado en el chat IA.",
      price: unlimitedBudget || !budgetPerPerson ? 0 : budgetPerPerson,
      city_id: selectedCity ?? undefined,
      duration_minutes: 240,
      max_capacity: people,
      provider_name: "Asistente IA",
    };

    addCustomPlanToCart(customPlan, people);
    setChatCartMessage(unlimitedBudget || !budgetPerPerson
      ? "Plan añadido al carrito con precio a consultar."
      : "Plan añadido al carrito. Puedes revisarlo y confirmar la reserva.");
  };

  const handleSubmitAiPlanIdea = async () => {
    const name = publishName.trim();
    const lastAssistantPlan = [...chatMessages].reverse().find((item) => item.role === "assistant")?.content ?? "";
    const budgetPerPerson = extractLastNumber(/(\d{1,4})\s*(?:€|euros?)/gi, 0);
    const people = extractLastNumber(/(?:we are|for|group of|somos|para|grupo de)\s*(\d{1,3})|(\d{1,3})\s*(?:people|friends|personas|amigos|amigas)/gi, 1);

    if (!name) {
      setPublishMessage("Ponle nombre a la idea antes de enviarla.");
      return;
    }

    if (!lastAssistantPlan) {
      setPublishMessage("Termina primero el plan con la IA y después envíalo para publicar.");
      return;
    }

    try {
      const res = await fetch("/api/ai-plan-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestedName: name,
          cityId: selectedCity,
          description: lastAssistantPlan,
          category: "Plan personalizado IA",
          suggestedPrice: budgetPerPerson,
          maxCapacity: people,
          durationMinutes: 240,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not send the proposal");
      }

      setPublishName("");
      setPublishMessage("Idea enviada. El equipo la revisará en la intranet antes de publicarla.");
    } catch (error) {
      setPublishMessage(error instanceof Error ? error.message : "Error enviando la propuesta.");
    }
  };

  const addCommunityIdeaToCart = (idea: CommunityIdea) => {
    const activity: Activity = {
      id: idea.created_activity_id,
      name: idea.suggested_name,
      category: idea.category,
      description: idea.description,
      price: idea.price,
      city_id: idea.city_id ?? undefined,
      duration_minutes: idea.duration_minutes ?? undefined,
      max_capacity: idea.max_capacity ?? undefined,
      provider_name: "Idea de la comunidad",
    };

    addActivityToCart(activity);
    navigate("/cart");
  };

  const selectedCityName = cities.find((c) => c.id === selectedCity)?.name || "Selecciona una ciudad";

  const featuredActivities = activities.slice(0, 3);
  const categories = Array.from(new Set(activities.map((activity) => activity.category))).slice(0, 4);
  const moods = ["Fiesta", "Aventura", "Gastro", "Relax", "Premium", "Sorpresa"];

  return (
    <main className="home-page" style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroOverlay}>
          <div style={styles.heroContent}>
            <span style={styles.kicker}>Despedidas de soltero</span>
            <h1 style={styles.title}>La despedida empieza aquí</h1>
            <p style={styles.subtitle}>
              Elige ciudad, mezcla actividades, pide ideas a Fedi y monta un plan con ritmo, presupuesto claro y cero líos de grupo.
            </p>
            <div style={styles.heroActions}>
              <button onClick={() => navigate("/catalog")} style={styles.heroButton}>
                Ver planes
              </button>
              <button onClick={() => document.getElementById("ai-chat")?.scrollIntoView({ behavior: "smooth" })} style={styles.heroGhostButton}>
                Hablar con Fedi
              </button>
            </div>
          </div>

          <aside style={styles.heroPanel}>
            <p style={styles.panelLabel}>Empieza por destino</p>
            <select
              value={selectedCity || ""}
              onChange={(e) => setSelectedCity(Number(e.target.value))}
              style={styles.heroSelect}
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} - {city.country}
                </option>
              ))}
            </select>
            <div style={styles.panelDivider} />
            <strong style={styles.panelCity}>{selectedCityName}</strong>
            <span style={styles.panelText}>{activities.length} planes y actividades disponibles</span>
            <button onClick={handleCreateGroup} style={styles.panelButton}>
              Montar despedida
            </button>
          </aside>
        </div>
      </section>

      <button className="fedi-mobile-toggle" onClick={() => setFediOpen(true)} style={styles.mobileFediButton}>
        Hablar con Fedi
      </button>

      <section id="ai-chat" className={`fedi-floating${footerVisible ? " fedi-over-footer" : ""}${fediOpen ? " fedi-mobile-open" : ""}`} style={styles.chatSection}>
        <div style={styles.chatIntro}>
          <button className="fedi-mobile-close" onClick={() => setFediOpen(false)} style={styles.mobileCloseButton}>Cerrar</button>
          <div style={styles.chatIntroCopy}>
            <span style={styles.fediBadge}>Fedi</span>
            <h2 style={styles.sectionTitle}>Tu copiloto de despedida</h2>
            <p style={styles.chatIntroText}>
              Pídele un plan, ajusta el presupuesto y deja que Fedi combine actividades reales con ideas personalizadas para el grupo.
            </p>
          </div>

          <div style={styles.fediActions}>
            <button onClick={() => sendChatMessage(`We are a group and we want a mixed plan in ${selectedCityName}. Use catalogue activities if they fit.`)} style={styles.fediChip}>
              Plan mixto
            </button>
            <button onClick={() => sendChatMessage(`Give me a budget option and a premium option in ${selectedCityName}.`)} style={styles.fediChip}>
              Barato / premium
            </button>
            <button onClick={() => sendChatMessage(`Surprise me with an original bachelor party in ${selectedCityName}.`)} style={styles.fediChip}>
              Sorpréndeme
            </button>
          </div>
        </div>

        <div className="fedi-chat-box" style={styles.chatBox}>
          <div className="fedi-chat-messages" style={styles.chatMessages}>
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                style={{
                  ...styles.chatBubble,
                  ...(message.role === "user" ? styles.chatBubbleUser : styles.chatBubbleAssistant),
                }}
              >
                <span>{message.content}</span>
                {message.role === "assistant" && <span style={styles.chatCheck}>✓✓</span>}
              </div>
            ))}
            {chatLoading && (
              <div style={{ ...styles.chatBubble, ...styles.chatBubbleAssistant }}>
                <span>Preparando ideas...</span>
                <span style={styles.chatCheck}>✓✓</span>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} style={styles.chatForm}>
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Escribe a Fedi..."
              style={styles.chatInput}
              disabled={chatLoading}
            />
            <button type="submit" style={styles.chatSendButton} disabled={chatLoading || !chatInput.trim()}>
              Enviar
            </button>
          </form>

          <div className="fedi-tools" style={styles.fediTools}>
            <div style={styles.fediToolPanel}>
              <div style={styles.fediToolColumns}>
                <div style={styles.fediToolColumn}>
                  <span style={styles.fediToolLabel}>Reserva</span>
                  <p style={styles.fediToolText}>Guarda el plan de Fedi y revísalo antes de reservar.</p>
                  <div style={styles.chatCartActions}>
                    <button onClick={handleAddAiPlanToCart} style={styles.chatCartButton} type="button">
                      Añadir plan
                    </button>
                    <button onClick={() => navigate("/cart")} style={styles.chatCartGhostButton} type="button">
                      Carrito
                    </button>
                  </div>
                  {chatCartMessage && <p style={styles.chatCartMessage}>{chatCartMessage}</p>}
                </div>

                <div style={styles.fediToolColumn}>
                  <span style={styles.fediToolLabel}>Publicar</span>
                  <p style={styles.fediToolText}>Ponle nombre y mándalo para revisarlo en la intranet.</p>
                  <div style={styles.publishBox}>
                    <input
                      value={publishName}
                      onChange={(event) => setPublishName(event.target.value)}
                      placeholder="Nombre de la despedida"
                      style={styles.publishInput}
                    />
                    <button onClick={handleSubmitAiPlanIdea} type="button" style={styles.publishButton}>
                      Enviar
                    </button>
                  </div>
                  {publishMessage && <p style={styles.publishMessage}>{publishMessage}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.statsGrid}>
        <div style={styles.stat}>
          <strong style={styles.statNumber}>{cities.length}</strong>
          <span style={styles.statText}>ciudades con planes</span>
        </div>
        <div style={styles.stat}>
          <strong style={styles.statNumber}>{activities.length}</strong>
          <span style={styles.statText}>actividades en {selectedCityName}</span>
        </div>
        <div style={styles.stat}>
          <strong style={styles.statNumber}>24h</strong>
          <span style={styles.statText}>para cerrar propuesta</span>
        </div>
        <div style={styles.stat}>
          <strong style={styles.statNumber}>1</strong>
          <span style={styles.statText}>carrito para el grupo</span>
        </div>
      </section>

      <section style={styles.reviewsSection}>
        <div style={styles.sectionHeader}>
          <div>
            <span style={styles.sectionKicker}>Reseñas</span>
            <h2 style={styles.sectionTitle}>Grupos que ya lo montaron con nosotros</h2>
          </div>
        </div>
        <div style={styles.reviewGrid}>
          {siteReviews.map((review) => (
            <article key={review.name} style={styles.reviewCard}>
              <div style={styles.reviewTop}>
                <div>
                  <strong style={styles.reviewName}>{review.name}</strong>
                  <span style={styles.reviewCity}>{review.city}</span>
                </div>
                <span style={styles.reviewStars}>{renderStars(review.rating)}</span>
              </div>
              <p style={styles.reviewText}>{review.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <span style={styles.sectionKicker}>Destacados</span>
            <h2 style={styles.sectionTitle}>Planazos en {selectedCityName}</h2>
          </div>
          <button onClick={() => navigate("/catalog")} style={styles.linkButton}>
            Ver todo
          </button>
        </div>

        <div style={styles.grid}>
          {loading ? (
            <p style={styles.loading}>Cargando actividades...</p>
          ) : activities.length === 0 ? (
            <p style={styles.empty}>No hay actividades en {selectedCityName}</p>
          ) : (
            featuredActivities.map((activity) => (
              <article key={activity.id} style={styles.card} onClick={() => handleActivityClick(activity.id)}>
                <div style={{ ...styles.cardImage, backgroundImage: `linear-gradient(180deg, rgba(29,16,40,0.06), rgba(29,16,40,0.72)), url('${getActivityImage(activity)}')` }}>
                  <span style={styles.cardBadge}>{activity.category}</span>
                </div>
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{activity.name}</h3>
                  <div style={styles.productRating}>
                    <span style={styles.ratingStars}>{renderStars(activity.avgRating)}</span>
                    <span>{Number(activity.avgRating) > 0 ? `${Number(activity.avgRating).toFixed(1)} / 5` : "Sin reseñas"}</span>
                  </div>
                  <p style={styles.cardDescription}>{activity.description}</p>
                  <div style={styles.cardMeta}>
                    <span>{activity.duration_minutes ? `${activity.duration_minutes} min` : "Duración flexible"}</span>
                    <span>{activity.max_capacity ? `Hasta ${activity.max_capacity}` : "Grupo abierto"}</span>
                  </div>
                  <div style={styles.cardFooter}>
                    <span style={styles.price}>{Number(activity.price).toFixed(2)} €</span>
                    <span style={styles.rating}>{Number(activity.avgRating) > 0 ? "Con reseñas" : "Nuevo"}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addActivityToCart(activity);
                      navigate("/cart");
                    }}
                    style={styles.secondaryButton}
                  >
                    Añadir al carrito
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section style={styles.splitSection}>
        <div style={styles.storyBlock}>
          <span style={styles.sectionKicker}>Cómo funciona</span>
          <h2 style={{ ...styles.sectionTitle, color: "#fff" }}>De idea suelta a plan reservado</h2>
          <p style={styles.storyText}>
            El grupo elige destino, compara propuestas y prepara una selección. El equipo recibe la reserva lista para gestionarla desde la intranet.
          </p>
        </div>
        <div style={styles.steps}>
          {[
            ["1", "Elige ciudad", "Filtra por destino y revisa actividades disponibles."],
            ["2", "Mezcla planes", "Añade actividades, ideas IA y propuestas del grupo."],
            ["3", "Confirma reserva", "El pedido llega listo para que el equipo lo gestione."],
          ].map(([number, title, text]) => (
            <div key={number} style={styles.step}>
              <span style={styles.stepNumber}>{number}</span>
              <div>
                <h3 style={styles.stepTitle}>{title}</h3>
                <p style={styles.stepText}>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.categorySection}>
        <div style={styles.sectionHeader}>
          <div>
            <span style={styles.sectionKicker}>Mood</span>
            <h2 style={styles.sectionTitle}>Elige el rollo del grupo</h2>
          </div>
        </div>
        <div style={styles.categoryGrid}>
          {(moods.length ? moods : categories).map((category) => (
            <button key={category} onClick={() => sendChatMessage(`Queremos una despedida estilo ${category} en ${selectedCityName}.`)} style={styles.categoryCard}>
              <strong>{category}</strong>
              <span>Pedir ideas a Fedi</span>
            </button>
          ))}
        </div>
      </section>

      <section style={styles.communitySection}>
        <div style={styles.sectionHeader}>
          <div>
            <span style={styles.sectionKicker}>Ideas de la comunidad</span>
            <h2 style={styles.sectionTitle}>Despedidas creadas por otros grupos</h2>
          </div>
        </div>

        {communityIdeas.length === 0 ? (
          <p style={styles.empty}>Todavía no hay despedidas de la comunidad publicadas. Envía una idea de Fedi y podrá aparecer aquí cuando se apruebe.</p>
        ) : (
          <div style={styles.communityGrid}>
            {communityIdeas.map((idea) => (
              <article key={idea.id} style={styles.communityCard}>
                <span style={styles.communityBadge}>{idea.city_name || "Destino abierto"}</span>
                <h3 style={styles.communityTitle}>{idea.suggested_name}</h3>
                <p style={styles.communityText}>{idea.description}</p>
                <div style={styles.communityMeta}>
                  <span>{idea.duration_minutes ? `${idea.duration_minutes} min` : "Duración flexible"}</span>
                  <span>{idea.max_capacity ? `Hasta ${idea.max_capacity}` : "Grupo abierto"}</span>
                </div>
                <div style={styles.communityFooter}>
                  <strong style={styles.price}>
                    {Number(idea.price) > 0 ? `${Number(idea.price).toFixed(2)} €` : "Presupuesto pendiente"}
                  </strong>
                  <div>
                    <button onClick={() => navigate(`/activity/${idea.created_activity_id}`)} style={styles.smallGhostButton}>
                      Ver
                    </button>
                    <button onClick={() => addCommunityIdeaToCart(idea)} style={styles.smallPrimaryButton}>
                      Añadir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={styles.ctaBand}>
        <div>
          <span style={styles.ctaKicker}>¿Necesitas una propuesta a medida?</span>
          <h2 style={styles.ctaTitle}>Fedi convierte una idea suelta en una reserva.</h2>
        </div>
        <button onClick={() => document.getElementById("ai-chat")?.scrollIntoView({ behavior: "smooth" })} style={styles.ctaButton}>
          Abrir Fedi
        </button>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: "1640px",
    margin: "0 auto",
    padding: "2rem",
    paddingRight: "430px",
  },
  hero: {
    backgroundImage:
      "linear-gradient(90deg, rgba(29,16,40,0.95), rgba(76,29,149,0.72) 45%, rgba(190,18,60,0.6)), url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80')",
    backgroundPosition: "center",
    backgroundSize: "cover",
    borderRadius: "8px",
    color: "#fff",
    minHeight: "560px",
    overflow: "hidden",
  },
  heroOverlay: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    gap: "2rem",
    padding: "3rem",
    minHeight: "560px",
  },
  heroContent: {
    maxWidth: "680px",
  },
  kicker: {
    background: "rgba(255, 191, 0, 0.2)",
    border: "1px solid rgba(255, 191, 0, 0.65)",
    borderRadius: "999px",
    display: "inline-block",
    color: "#fde68a",
    fontSize: "0.9rem",
    fontWeight: 900,
    marginBottom: "1rem",
    padding: "0.45rem 0.7rem",
  },
  heroButton: {
    background: "linear-gradient(135deg, #ffbf00, #ff3e6c)",
    border: "none",
    borderRadius: "999px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 700,
    boxShadow: "0 14px 28px rgba(255, 62, 108, 0.34)",
    padding: "1.05rem 1.75rem",
    whiteSpace: "nowrap",
  },
  heroGhostButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(253,230,138,0.72)",
    borderRadius: "999px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 700,
    padding: "1.05rem 1.75rem",
  },
  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.8rem",
    marginTop: "1.5rem",
  },
  title: {
    fontFamily: "Arial Black, Trebuchet MS, Arial, sans-serif",
    fontSize: "clamp(3.2rem, 7vw, 5.9rem)",
    lineHeight: 1.02,
    marginBottom: "1rem",
    color: "#fff",
  },
  subtitle: {
    fontSize: "1.24rem",
    lineHeight: 1.65,
    color: "#e0f2fe",
    marginBottom: "1rem",
  },
  heroPanel: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), #fff1f2)",
    border: "1px solid rgba(255, 191, 0, 0.45)",
    borderRadius: "8px",
    boxShadow: "0 22px 60px rgba(0,0,0,0.24)",
    color: "#111827",
    minWidth: "330px",
    padding: "1.65rem",
  },
  panelLabel: {
    color: "#be123c",
    fontSize: "0.85rem",
    fontWeight: 700,
    marginBottom: "0.6rem",
    textTransform: "uppercase",
  },
  heroSelect: {
    border: "2px solid #fbbf24",
    borderRadius: "8px",
    fontSize: "1rem",
    padding: "0.9rem",
    width: "100%",
  },
  panelDivider: {
    background: "linear-gradient(90deg, #ffbf00, #ff3e6c)",
    height: "3px",
    margin: "1.2rem 0",
  },
  panelCity: {
    display: "block",
    fontSize: "1.4rem",
    marginBottom: "0.35rem",
  },
  panelText: {
    color: "#6b7280",
    display: "block",
    marginBottom: "1rem",
  },
  panelButton: {
    background: "linear-gradient(135deg, #ffbf00, #ff3e6c)",
    border: "none",
    borderRadius: "999px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 12px 22px rgba(255, 62, 108, 0.25)",
    padding: "1rem 1.1rem",
    width: "100%",
  },
  chatSection: {
    alignItems: "stretch",
    background: "linear-gradient(135deg, #fff7ed, #fff1f2 55%, #fef3c7)",
    border: "1px solid #fbbf24",
    borderRadius: "8px",
    boxShadow: "0 22px 52px rgba(15, 23, 42, 0.12)",
    display: "grid",
    gap: 0,
    gridTemplateColumns: "1fr",
    margin: "1.2rem 0 3rem",
    overflow: "hidden",
    padding: 0,
  },
  mobileFediButton: {
    background: "linear-gradient(135deg, #ffbf00, #ff3e6c)",
    border: "none",
    borderRadius: 999,
    bottom: 18,
    boxShadow: "0 16px 34px rgba(255,62,108,0.32)",
    color: "#fff",
    cursor: "pointer",
    display: "none",
    fontWeight: 900,
    padding: "0.95rem 1.2rem",
    position: "fixed",
    right: 18,
    zIndex: 38,
  },
  mobileCloseButton: {
    alignSelf: "flex-end",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: 999,
    color: "#9f1239",
    cursor: "pointer",
    display: "none",
    fontWeight: 900,
    padding: "0.45rem 0.7rem",
  },
  chatIntro: {
    alignItems: "center",
    background: "rgba(255,255,255,0.76)",
    borderBottom: "2px solid #fbbf24",
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
    padding: "1.35rem 1.5rem",
    textAlign: "center",
  },
  chatIntroCopy: {
    margin: "0 auto",
    minWidth: 0,
  },
  fediBadge: {
    background: "linear-gradient(135deg, #4c1d95, #be123c)",
    borderRadius: "999px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "0.76rem",
    fontWeight: 800,
    letterSpacing: "0.02em",
    marginBottom: "0.5rem",
    padding: "0.32rem 0.58rem",
    textTransform: "uppercase",
  },
  chatIntroText: {
    color: "#475569",
    fontSize: "0.95rem",
    lineHeight: 1.5,
    margin: "0.55rem 0 0",
    maxWidth: 720,
  },
  fediActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.55rem",
    justifyContent: "center",
    marginTop: "0.1rem",
  },
  fediChip: {
    background: "#ffffff",
    border: "1px solid #fbbf24",
    borderRadius: "999px",
    color: "#9f1239",
    cursor: "pointer",
    fontSize: "0.86rem",
    fontWeight: 800,
    minHeight: 38,
    padding: "0.5rem 0.85rem",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  chatBox: {
    background: "rgba(255,255,255,0.9)",
    display: "flex",
    flexDirection: "column",
    minHeight: "560px",
    overflow: "hidden",
  },
  chatMessages: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: "0.75rem",
    minHeight: "300px",
    maxHeight: "470px",
    overflowY: "auto",
    padding: "1rem",
  },
  chatBubble: {
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    lineHeight: 1.45,
    maxWidth: "84%",
    padding: "0.75rem 0.9rem",
    whiteSpace: "pre-wrap",
  },
  chatBubbleAssistant: {
    alignSelf: "flex-start",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#1d1028",
  },
  chatBubbleUser: {
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, #4c1d95, #be123c)",
    color: "#ffffff",
  },
  chatCheck: {
    alignSelf: "flex-end",
    color: "#34b7f1",
    fontSize: "0.78rem",
    fontWeight: 900,
    lineHeight: 1,
  },
  chatForm: {
    borderTop: "2px solid #fed7aa",
    display: "flex",
    gap: "0.75rem",
    padding: "1rem",
  },
  chatInput: {
    border: "2px solid #fbbf24",
    borderRadius: "999px",
    flex: 1,
    fontSize: "0.95rem",
    minWidth: 0,
    padding: "0.95rem 1rem",
  },
  chatSendButton: {
    background: "linear-gradient(135deg, #ffbf00, #ff3e6c)",
    border: "none",
    borderRadius: "999px",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 800,
    padding: "0.95rem 1.15rem",
    whiteSpace: "nowrap",
  },
  chatCartActions: {
    display: "flex",
    gap: "0.75rem",
  },
  chatCartButton: {
    background: "#4c1d95",
    border: "none",
    borderRadius: "999px",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "0.86rem",
    fontWeight: 800,
    padding: "0.52rem 0.68rem",
  },
  chatCartGhostButton: {
    background: "#fff7ed",
    border: "1px solid #fbbf24",
    borderRadius: "999px",
    color: "#9f1239",
    cursor: "pointer",
    fontSize: "0.86rem",
    fontWeight: 800,
    padding: "0.52rem 0.68rem",
  },
  chatCartMessage: {
    color: "#0f766e",
    fontSize: "0.9rem",
    fontWeight: 700,
    margin: "0.65rem 0 0",
  },
  fediTools: {
    background: "#fff7ed",
    borderTop: "2px solid #fed7aa",
    padding: "0.9rem",
  },
  fediToolPanel: {
    background: "#ffffff",
    border: "1px solid #fed7aa",
    borderRadius: "8px",
    padding: "1rem",
  },
  fediToolColumns: {
    display: "grid",
    gap: "0.85rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  },
  fediToolColumn: {
    minWidth: 0,
  },
  fediToolLabel: {
    color: "#be123c",
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 900,
    marginBottom: "0.4rem",
    textTransform: "uppercase",
  },
  fediToolText: {
    color: "#64748b",
    fontSize: "0.9rem",
    lineHeight: 1.45,
    margin: "0 0 0.75rem",
  },
  publishBox: {
    display: "flex",
    gap: "0.75rem",
  },
  publishInput: {
    border: "2px solid #fed7aa",
    borderRadius: "10px",
    flex: 1,
    minWidth: 0,
    minHeight: "38px",
    padding: "0.75rem",
  },
  publishButton: {
    background: "#4c1d95",
    border: "none",
    borderRadius: "999px",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "0.86rem",
    fontWeight: 800,
    padding: "0.52rem 0.68rem",
    whiteSpace: "nowrap",
  },
  publishMessage: {
    color: "#312e81",
    fontSize: "0.9rem",
    fontWeight: 700,
    margin: "0.65rem 0 0",
  },
  statsGrid: {
    display: "grid",
    gap: "1.15rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    margin: "1.2rem 0 3rem",
  },
  reviewsSection: {
    marginBottom: "3rem",
  },
  reviewGrid: {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  },
  reviewCard: {
    background: "linear-gradient(180deg, #ffffff, #fff7ed)",
    border: "1px solid #fed7aa",
    borderRadius: "8px",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
    padding: "1.15rem",
  },
  reviewTop: {
    alignItems: "start",
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "0.8rem",
  },
  reviewName: {
    color: "#111827",
    display: "block",
    fontSize: "1rem",
  },
  reviewCity: {
    color: "#be123c",
    display: "block",
    fontSize: "0.86rem",
    fontWeight: 800,
    marginTop: "0.15rem",
  },
  reviewStars: {
    color: "#f59e0b",
    fontSize: "1rem",
    letterSpacing: "0.03em",
    whiteSpace: "nowrap",
  },
  reviewText: {
    color: "#475569",
    lineHeight: 1.55,
    margin: 0,
  },
  stat: {
    background: "linear-gradient(180deg, #ffffff, #fff7ed)",
    border: "1px solid #fed7aa",
    borderRadius: "8px",
    boxShadow: "0 14px 32px rgba(76, 29, 149, 0.1)",
    padding: "1.5rem",
  },
  statNumber: {
    color: "#be123c",
    display: "block",
    fontSize: "2rem",
  },
  statText: {
    color: "#6b7280",
  },
  section: {
    marginBottom: "3rem",
  },
  sectionHeader: {
    alignItems: "end",
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "1.2rem",
  },
  sectionKicker: {
    color: "#be123c",
    display: "block",
    fontSize: "0.82rem",
    fontWeight: 800,
    letterSpacing: "0.02em",
    marginBottom: "0.35rem",
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: "#1d1028",
    fontSize: "2rem",
    lineHeight: 1.15,
    margin: 0,
  },
  linkButton: {
    background: "#fff7ed",
    border: "2px solid #fbbf24",
    borderRadius: "999px",
    color: "#9f1239",
    cursor: "pointer",
    fontWeight: 700,
    padding: "0.85rem 1.2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #fed7aa",
    borderRadius: "8px",
    cursor: "pointer",
    overflow: "hidden",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 18px 38px rgba(76, 29, 149, 0.14)",
  },
  cardImage: {
    alignItems: "start",
    backgroundPosition: "center",
    backgroundSize: "cover",
    display: "flex",
    minHeight: "190px",
    padding: "1rem",
  },
  cardBadge: {
    background: "#1d1028",
    borderRadius: "999px",
    color: "#fff",
    fontSize: "0.8rem",
    fontWeight: 700,
    padding: "0.35rem 0.65rem",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "1.2rem",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    margin: "0",
    color: "#172033",
  },
  productRating: {
    alignItems: "center",
    color: "#64748b",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.88rem",
    gap: "0.45rem",
  },
  ratingStars: {
    color: "#f59e0b",
    fontSize: "1rem",
    letterSpacing: "0.03em",
  },
  cardDescription: {
    fontSize: "0.95rem",
    color: "#555",
    margin: "0",
    lineHeight: "1.4",
  },
  cardMeta: {
    color: "#6b7280",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.86rem",
    gap: "0.6rem",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.5rem",
    paddingTop: "0.75rem",
    borderTop: "1px solid #eee",
  },
  price: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#be123c",
  },
  rating: {
    fontSize: "0.9rem",
    color: "#f97316",
  },
  secondaryButton: {
    background: "linear-gradient(135deg, #4c1d95, #be123c)",
    border: "none",
    borderRadius: "999px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    padding: "0.85rem 1rem",
  },
  splitSection: {
    alignItems: "start",
    background: "linear-gradient(135deg, #1d1028, #4c1d95 52%, #be123c)",
    borderRadius: "8px",
    color: "#fff",
    display: "grid",
    gap: "2rem",
    gridTemplateColumns: "minmax(0, 0.9fr) minmax(320px, 1.1fr)",
    marginBottom: "3rem",
    padding: "2rem",
  },
  storyBlock: {
    maxWidth: "460px",
  },
  storyText: {
    color: "#d1d5db",
    lineHeight: 1.6,
    marginTop: "1rem",
  },
  steps: {
    display: "grid",
    gap: "1rem",
  },
  step: {
    alignItems: "start",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(253,230,138,0.42)",
    borderRadius: "8px",
    display: "flex",
    gap: "1rem",
    padding: "1rem",
  },
  stepNumber: {
    alignItems: "center",
    background: "#ffbf00",
    borderRadius: "999px",
    color: "#312e81",
    display: "inline-flex",
    fontWeight: 800,
    height: "34px",
    justifyContent: "center",
    minWidth: "34px",
  },
  stepTitle: {
    fontSize: "1rem",
    margin: "0 0 0.25rem",
  },
  stepText: {
    color: "#d1d5db",
    lineHeight: 1.5,
    margin: 0,
  },
  categorySection: {
    marginBottom: "3rem",
  },
  categoryGrid: {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  categoryCard: {
    alignItems: "start",
    background: "linear-gradient(180deg, #fff, #fff7ed)",
    border: "1px solid #fed7aa",
    borderRadius: "8px",
    color: "#111827",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    minHeight: "140px",
    padding: "1.45rem",
    textAlign: "left",
  },
  communitySection: {
    marginBottom: "3rem",
  },
  communityGrid: {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  },
  communityCard: {
    background: "linear-gradient(180deg, #ffffff, #fff7ed)",
    border: "1px solid #fed7aa",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "1.1rem",
  },
  communityBadge: {
    alignSelf: "flex-start",
    background: "#fff1f2",
    borderRadius: "999px",
    color: "#be123c",
    fontSize: "0.8rem",
    fontWeight: 800,
    padding: "0.35rem 0.65rem",
  },
  communityTitle: {
    color: "#111827",
    fontSize: "1.15rem",
    margin: 0,
  },
  communityText: {
    color: "#4b5563",
    lineHeight: 1.45,
    margin: 0,
    maxHeight: 120,
    overflow: "hidden",
    whiteSpace: "pre-wrap",
  },
  communityMeta: {
    color: "#6b7280",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.86rem",
    gap: "0.7rem",
  },
  communityFooter: {
    alignItems: "center",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    gap: "0.75rem",
    marginTop: "auto",
    paddingTop: "0.75rem",
  },
  smallGhostButton: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "6px",
    color: "#c2410c",
    cursor: "pointer",
    fontWeight: 800,
    marginRight: "0.45rem",
    padding: "0.55rem 0.75rem",
  },
  smallPrimaryButton: {
    background: "#4c1d95",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    padding: "0.55rem 0.75rem",
  },
  ctaBand: {
    alignItems: "center",
    background: "linear-gradient(90deg, #fff7ed, #fff1f2)",
    border: "1px solid #fbbf24",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "2rem",
  },
  ctaKicker: {
    color: "#be123c",
    fontWeight: 800,
  },
  ctaTitle: {
    color: "#111827",
    fontSize: "1.7rem",
    margin: "0.35rem 0 0",
  },
  ctaButton: {
    background: "linear-gradient(135deg, #ffbf00, #ff3e6c)",
    border: "none",
    borderRadius: "999px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    padding: "1rem 1.55rem",
  },
  loading: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "2rem",
    color: "#666",
  },
  empty: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "2rem",
    color: "#999",
  },
};

export default Home;
