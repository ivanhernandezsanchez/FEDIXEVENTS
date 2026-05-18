import { useEffect, useState } from "react";
import type { City, Activity } from "../types";
import { useNavigate } from "react-router-dom";
import { addActivityToCart, addCustomPlanToCart } from "../cart";
import { getActivityImage, renderStars } from "../visuals";
import { useUser } from "../UserContext";

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
    text: "We wrapped up activities, budget and cart in one afternoon. The group arrived with everything sorted and no endless debates.",
  },
  {
    name: "Lucía R.",
    city: "Valencia",
    rating: 5,
    text: "Fedi suggested a mixed plan with food, a surprise and a night out. It felt like it was made by someone who knew our group.",
  },
  {
    name: "Andrés P.",
    city: "Sevilla",
    rating: 4,
    text: "Really convenient for comparing options and saving ideas. The activity reviews were a big help when it came to deciding.",
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
      content: "I'm Fedi. Tell me how many of you there are, the kind of vibe you're after, and your approximate budget — I'll mix catalogue activities, tailored ideas and a cart into a plan ready to book.",
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
      name: `AI Plan in ${selectedCityName}`,
      category: "Custom AI Plan",
      description: lastAssistantPlan || "Custom plan agreed in the AI chat.",
      price: unlimitedBudget || !budgetPerPerson ? 0 : budgetPerPerson,
      city_id: selectedCity ?? undefined,
      duration_minutes: 240,
      max_capacity: people,
      provider_name: "AI Assistant",
    };

    addCustomPlanToCart(customPlan, people);
    setChatCartMessage(unlimitedBudget || !budgetPerPerson
      ? "Plan added to cart — price on request."
      : "Plan added to cart. Review it and confirm your booking.");
  };

  const handleSubmitAiPlanIdea = async () => {
    const name = publishName.trim();
    const lastAssistantPlan = [...chatMessages].reverse().find((item) => item.role === "assistant")?.content ?? "";
    const budgetPerPerson = extractLastNumber(/(\d{1,4})\s*(?:€|euros?)/gi, 0);
    const people = extractLastNumber(/(?:we are|for|group of|somos|para|grupo de)\s*(\d{1,3})|(\d{1,3})\s*(?:people|friends|personas|amigos|amigas)/gi, 1);

    if (!name) {
      setPublishMessage("Give the idea a name before sending.");
      return;
    }

    if (!lastAssistantPlan) {
      setPublishMessage("Finish the AI plan first, then submit it to publish.");
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
      setPublishMessage("Idea submitted. The team will review it in the intranet before publishing.");
    } catch (error) {
      setPublishMessage(error instanceof Error ? error.message : "Error sending the proposal.");
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
      provider_name: "Community idea",
    };

    addActivityToCart(activity);
    navigate("/cart");
  };

  const selectedCityName = cities.find((c) => c.id === selectedCity)?.name || "Select a city";

  const featuredActivities = activities.slice(0, 3);
  const categories = Array.from(new Set(activities.map((activity) => activity.category))).slice(0, 4);
  const moods = ["Party", "Adventure", "Gastro", "Relax", "Premium", "Surprise"];

  return (
    <main className="home-page" style={styles.page}>
      <section style={styles.hero}>
        {/* Floating decorative shapes */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          {/* Large central glow */}
          <div style={styles.centralGlow} />
          {/* Orange sphere top-right */}
          <div style={{ ...styles.floatShape, top: "9%", right: "11%", width: 72, height: 72, background: "radial-gradient(circle at 35% 32%, #FB923C, #F97316 55%, #DB2777)", boxShadow: "0 0 48px rgba(249,115,22,0.75), 0 0 90px rgba(249,115,22,0.3)" }} />
          {/* Purple sphere top-left */}
          <div style={{ ...styles.floatShape, top: "16%", left: "9%", width: 52, height: 52, background: "radial-gradient(circle at 35% 32%, #C084FC, #7C3AED 60%, #2E1065)", boxShadow: "0 0 32px rgba(168,85,247,0.7), 0 0 64px rgba(168,85,247,0.3)" }} />
          {/* Pink sphere bottom-left */}
          <div style={{ ...styles.floatShape, bottom: "22%", left: "5%", width: 90, height: 90, background: "radial-gradient(circle at 35% 32%, #F472B6, #DB2777 60%, #9D174D)", boxShadow: "0 0 48px rgba(219,39,119,0.65), 0 0 88px rgba(219,39,119,0.25)" }} />
          {/* Small orange sphere mid-right */}
          <div style={{ ...styles.floatShape, top: "52%", right: "7%", width: 56, height: 56, background: "radial-gradient(circle at 35% 32%, #FCD34D, #F97316 55%, #EA580C)", boxShadow: "0 0 32px rgba(249,115,22,0.65), 0 0 60px rgba(249,115,22,0.25)" }} />
          {/* Tiny purple sphere bottom-right */}
          <div style={{ ...styles.floatShape, bottom: "14%", right: "22%", width: 38, height: 38, background: "radial-gradient(circle at 35% 32%, #A78BFA, #7C3AED)", boxShadow: "0 0 20px rgba(124,58,237,0.6)" }} />
          {/* Triangle top-right */}
          <div style={{ position: "absolute", top: "20%", right: "26%", width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderBottom: "28px solid rgba(249,115,22,0.65)", filter: "drop-shadow(0 0 8px rgba(249,115,22,0.9))" }} />
          {/* Triangle bottom-left area */}
          <div style={{ position: "absolute", bottom: "38%", left: "20%", width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderBottom: "22px solid rgba(168,85,247,0.55)", filter: "drop-shadow(0 0 6px rgba(168,85,247,0.7))" }} />
          {/* Rounded rect bottom-right */}
          <div style={{ position: "absolute", bottom: "28%", right: "10%", width: 44, height: 44, borderRadius: 10, background: "rgba(219,39,119,0.18)", border: "1px solid rgba(219,39,119,0.55)", backdropFilter: "blur(6px)", boxShadow: "0 0 16px rgba(219,39,119,0.3)" }} />
          {/* Rounded rect mid-left */}
          <div style={{ position: "absolute", top: "55%", left: "15%", width: 34, height: 34, borderRadius: 8, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.45)", backdropFilter: "blur(4px)" }} />
          {/* Quote mark decoration */}
          <div style={{ position: "absolute", top: "38%", left: "28%", fontSize: "5rem", color: "rgba(249,115,22,0.08)", fontWeight: 900, lineHeight: 1 }}>"</div>
        </div>

        {/* Centered hero content */}
        <div style={styles.heroContent}>
          <h1 style={styles.title}>The celebration<br />starts here</h1>
          <p style={{
            fontStyle: "italic",
            color: "#F97316",
            fontSize: "1.05rem",
            fontWeight: 600,
            margin: "0.2rem 0 0.6rem",
            letterSpacing: "0.01em",
          }}>
            "Because regret is for the day after."
          </p>
          <p style={styles.subtitle}>
            Plan the perfect stag or hen party with the help of our AI. Fast, easy and stress-free.
          </p>

          <div style={styles.searchRow}>
            <div style={styles.searchBox}>
              <span style={{ color: "#9ca3af", fontSize: 18, lineHeight: 1 }}>🔍</span>
              <input
                placeholder="Search ideas..."
                style={styles.searchInput}
                onClick={() => document.getElementById("ai-chat")?.scrollIntoView({ behavior: "smooth" })}
                readOnly
              />
            </div>
            <button onClick={() => navigate("/catalog")} style={styles.heroCta}>
              Explore now
            </button>
          </div>

          <div style={styles.destinoRow}>
            <span style={{ color: "#6b7280", fontSize: "0.88rem" }}>Destination:</span>
            <select
              value={selectedCity || ""}
              onChange={(e) => setSelectedCity(Number(e.target.value))}
              style={styles.destinoSelect}
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>· {activities.length} activities</span>
          </div>
        </div>
      </section>

      {/* Mini preview cards row - like in mockup */}
      {featuredActivities.length > 0 && (
        <div className="mini-cards-row">
          {featuredActivities.map((activity) => (
            <article
              key={activity.id}
              onClick={() => handleActivityClick(activity.id)}
              style={styles.miniCard}
            >
              <div style={styles.miniCardGlow} />
              <span style={styles.miniCardCategory}>{activity.category}</span>
              <strong style={styles.miniCardTitle}>{activity.name}</strong>
              <span style={styles.miniCardPrice}>{Number(activity.price).toFixed(2)} €</span>
            </article>
          ))}
        </div>
      )}

      <div style={{ padding: "0 2rem" }}>
      <button className="fedi-mobile-toggle" onClick={() => setFediOpen(true)} style={styles.mobileFediButton}>
        Talk to Fedi
      </button>

      <section id="ai-chat" className={`fedi-floating${footerVisible ? " fedi-over-footer" : ""}${fediOpen ? " fedi-mobile-open" : ""}`} style={styles.chatSection}>
        <div className="fedi-intro" style={styles.chatIntro}>
          <button className="fedi-mobile-close" onClick={() => setFediOpen(false)} style={styles.mobileCloseButton}>Close</button>
          <div style={styles.chatIntroCopy}>
            <span style={styles.fediBadge}>Fedi</span>
            <h2 style={styles.sectionTitle}>Your celebration co-pilot</h2>
            <p style={styles.chatIntroText}>
              Ask for a plan, adjust the budget and let Fedi combine real activities with personalised ideas for your group.
            </p>
          </div>

          <div style={styles.fediActions}>
            <button onClick={() => sendChatMessage(`We are a group and we want a mixed plan in ${selectedCityName}. Use catalogue activities if they fit.`)} style={styles.fediChip}>
              Mixed plan
            </button>
            <button onClick={() => sendChatMessage(`Give me a budget option and a premium option in ${selectedCityName}.`)} style={styles.fediChip}>
              Budget / premium
            </button>
            <button onClick={() => sendChatMessage(`Surprise me with an original bachelor party in ${selectedCityName}.`)} style={styles.fediChip}>
              Surprise me
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
                <span>Preparing ideas...</span>
                <span style={styles.chatCheck}>✓✓</span>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} style={styles.chatForm}>
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Message Fedi..."
              style={styles.chatInput}
              disabled={chatLoading}
            />
            <button type="submit" style={styles.chatSendButton} disabled={chatLoading || !chatInput.trim()}>
              Send
            </button>
          </form>

          <div className="fedi-tools" style={styles.fediTools}>
            <div style={styles.fediToolPanel}>
              <div style={styles.fediToolColumns}>
                <div style={styles.fediToolColumn}>
                  <span style={styles.fediToolLabel}>Booking</span>
                  <p style={styles.fediToolText}>Save Fedi's plan and review it before booking.</p>
                  <div style={styles.chatCartActions}>
                    <button onClick={handleAddAiPlanToCart} style={styles.chatCartButton} type="button">
                      Add plan
                    </button>
                    <button onClick={() => navigate("/cart")} style={styles.chatCartGhostButton} type="button">
                      Cart
                    </button>
                  </div>
                  {chatCartMessage && <p style={styles.chatCartMessage}>{chatCartMessage}</p>}
                </div>

                <div style={styles.fediToolColumn}>
                  <span style={styles.fediToolLabel}>Publish</span>
                  <p style={styles.fediToolText}>Give it a name and send it for review in the intranet.</p>
                  <div style={styles.publishBox}>
                    <input
                      value={publishName}
                      onChange={(event) => setPublishName(event.target.value)}
                      placeholder="Name your celebration"
                      style={styles.publishInput}
                    />
                    <button onClick={handleSubmitAiPlanIdea} type="button" style={styles.publishButton}>
                      Send
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
          <span style={styles.statText}>cities with plans</span>
        </div>
        <div style={styles.stat}>
          <strong style={styles.statNumber}>{activities.length}</strong>
          <span style={styles.statText}>activities in {selectedCityName}</span>
        </div>
        <div style={styles.stat}>
          <strong style={styles.statNumber}>24h</strong>
          <span style={styles.statText}>to close a proposal</span>
        </div>
        <div style={styles.stat}>
          <strong style={styles.statNumber}>1</strong>
          <span style={styles.statText}>shared group cart</span>
        </div>
      </section>

      <section style={styles.reviewsSection}>
        <div style={styles.sectionHeader}>
          <div>
            <span style={styles.sectionKicker}>Reviews</span>
            <h2 style={styles.sectionTitle}>Groups who planned with us</h2>
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
            <span style={styles.sectionKicker}>Featured</span>
            <h2 style={styles.sectionTitle}>Top picks in {selectedCityName}</h2>
          </div>
          <button onClick={() => navigate("/catalog")} style={styles.linkButton}>
            View all
          </button>
        </div>

        <div style={styles.grid}>
          {loading ? (
            <p style={styles.loading}>Loading activities...</p>
          ) : activities.length === 0 ? (
            <p style={styles.empty}>No activities in {selectedCityName}</p>
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
                    <span>{Number(activity.avgRating) > 0 ? `${Number(activity.avgRating).toFixed(1)} / 5` : "No reviews"}</span>
                  </div>
                  <p style={styles.cardDescription}>{activity.description}</p>
                  <div style={styles.cardMeta}>
                    <span>{activity.duration_minutes ? `${activity.duration_minutes} min` : "Flexible duration"}</span>
                    <span>{activity.max_capacity ? `Up to ${activity.max_capacity}` : "Open group"}</span>
                  </div>
                  <div style={styles.cardFooter}>
                    <span style={styles.price}>{Number(activity.price).toFixed(2)} €</span>
                    <span style={styles.rating}>{Number(activity.avgRating) > 0 ? "Reviewed" : "New"}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addActivityToCart(activity);
                      navigate("/cart");
                    }}
                    style={styles.secondaryButton}
                  >
                    Add to cart
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="how-it-works" style={styles.splitSection}>
        <div style={styles.storyBlock}>
          <span style={styles.sectionKicker}>How it works</span>
          <h2 style={{ ...styles.sectionTitle, color: "#fff" }}>From loose idea to confirmed booking</h2>
          <p style={styles.storyText}>
            The group picks a destination, compares proposals and builds a selection. The team receives the booking ready to manage from the intranet.
          </p>
          <button onClick={() => navigate("/catalog")} style={styles.storyBtn}>
            Explore activities →
          </button>
        </div>
        <div style={styles.steps}>
          {[
            { num: "01", icon: "🗺️", title: "Choose a city", text: "Filter by destination and browse all available activities." },
            { num: "02", icon: "🎉", title: "Mix and match", text: "Add activities, AI ideas and group suggestions to your cart." },
            { num: "03", icon: "✅", title: "Confirm booking", text: "Your order reaches the team ready to be managed from the intranet." },
          ].map(({ num, icon, title, text }) => (
            <div key={num} style={styles.step}>
              <span style={styles.stepNumber}>{num}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>{icon}</span>
                  <h3 style={styles.stepTitle}>{title}</h3>
                </div>
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
            <h2 style={styles.sectionTitle}>Pick your group's vibe</h2>
          </div>
        </div>
        <div style={styles.categoryGrid}>
          {(moods.length ? moods : categories).map((category) => (
            <button key={category} onClick={() => sendChatMessage(`We want a ${category} style celebration in ${selectedCityName}.`)} style={styles.categoryCard}>
              <strong>{category}</strong>
              <span>Ask Fedi for ideas</span>
            </button>
          ))}
        </div>
      </section>

      <section style={styles.communitySection}>
        <div style={styles.sectionHeader}>
          <div>
            <span style={styles.sectionKicker}>Community ideas</span>
            <h2 style={styles.sectionTitle}>Celebrations created by other groups</h2>
          </div>
        </div>

        {communityIdeas.length === 0 ? (
          <p style={styles.empty}>No community celebrations published yet. Submit a Fedi idea and it may appear here once approved.</p>
        ) : (
          <div style={styles.communityGrid}>
            {communityIdeas.map((idea) => (
              <article key={idea.id} style={styles.communityCard}>
                <span style={styles.communityBadge}>{idea.city_name || "Open destination"}</span>
                <h3 style={styles.communityTitle}>{idea.suggested_name}</h3>
                <p style={styles.communityText}>{idea.description}</p>
                <div style={styles.communityMeta}>
                  <span>{idea.duration_minutes ? `${idea.duration_minutes} min` : "Flexible duration"}</span>
                  <span>{idea.max_capacity ? `Up to ${idea.max_capacity}` : "Open group"}</span>
                </div>
                <div style={styles.communityFooter}>
                  <strong style={styles.price}>
                    {Number(idea.price) > 0 ? `${Number(idea.price).toFixed(2)} €` : "Price pending"}
                  </strong>
                  <div>
                    <button onClick={() => navigate(`/activity/${idea.created_activity_id}`)} style={styles.smallGhostButton}>
                      View
                    </button>
                    <button onClick={() => addCommunityIdeaToCart(idea)} style={styles.smallPrimaryButton}>
                      Add
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
          <span style={styles.ctaKicker}>Need a tailor-made proposal?</span>
          <h2 style={styles.ctaTitle}>Fedi turns a loose idea into a booking.</h2>
        </div>
        <button onClick={() => document.getElementById("ai-chat")?.scrollIntoView({ behavior: "smooth" })} style={styles.ctaButton}>
          Open Fedi
        </button>
      </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: "1640px",
    margin: "0 auto",
    paddingRight: "430px",
  },
  hero: {
    position: "relative",
    minHeight: "640px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: "0",
  },
  centralGlow: {
    position: "absolute",
    bottom: "-15%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "700px",
    height: "480px",
    background: "radial-gradient(ellipse, rgba(249,115,22,0.38) 0%, rgba(219,39,119,0.22) 42%, transparent 68%)",
    filter: "blur(55px)",
    pointerEvents: "none",
  },
  floatShape: {
    position: "absolute",
    borderRadius: "50%",
  } as React.CSSProperties,
  heroContent: {
    position: "relative",
    zIndex: 1,
    textAlign: "center" as const,
    maxWidth: "660px",
    padding: "5rem 2rem 4rem",
  },
  kicker: {
    background: "rgba(168, 85, 247, 0.18)",
    border: "1px solid rgba(168, 85, 247, 0.55)",
    borderRadius: "999px",
    display: "inline-block",
    color: "#e9d5ff",
    fontSize: "0.9rem",
    fontWeight: 900,
    marginBottom: "1rem",
    padding: "0.45rem 0.7rem",
  },
  heroButton: {
    background: "linear-gradient(135deg, #DB2777, #F97316)",
    border: "none",
    borderRadius: "999px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 700,
    boxShadow: "0 14px 28px rgba(249, 115, 22, 0.4)",
    padding: "1.05rem 1.75rem",
    whiteSpace: "nowrap",
  },
  heroGhostButton: {
    backgroundColor: "rgba(168, 85, 247, 0.12)",
    border: "1px solid rgba(168, 85, 247, 0.6)",
    borderRadius: "999px",
    color: "#e9d5ff",
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
    justifyContent: "center",
  },
  title: {
    fontFamily: "Arial Black, Trebuchet MS, Arial, sans-serif",
    fontSize: "clamp(3.2rem, 7.5vw, 6.2rem)",
    lineHeight: 1.0,
    marginBottom: "1.2rem",
    color: "#fff",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    fontSize: "1.12rem",
    lineHeight: 1.65,
    color: "#9ca3af",
    marginBottom: "0",
    maxWidth: 520,
    margin: "0 auto",
  },
  searchRow: {
    alignItems: "center",
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "999px",
    display: "flex",
    gap: "0.5rem",
    margin: "2.2rem auto 0",
    maxWidth: 540,
    padding: "0.45rem 0.45rem 0.45rem 1.2rem",
  },
  searchBox: {
    alignItems: "center",
    display: "flex",
    flex: 1,
    gap: "0.6rem",
    minWidth: 0,
  },
  searchInput: {
    background: "transparent",
    border: "none",
    color: "#d1d5db",
    cursor: "pointer",
    flex: 1,
    fontSize: "0.95rem",
    minWidth: 0,
    outline: "none",
  },
  heroCta: {
    background: "linear-gradient(135deg, #DB2777, #F97316)",
    border: "none",
    borderRadius: "999px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 700,
    padding: "0.85rem 1.4rem",
    whiteSpace: "nowrap",
    boxShadow: "0 8px 24px rgba(249,115,22,0.4)",
  },
  destinoRow: {
    alignItems: "center",
    display: "flex",
    gap: "0.65rem",
    justifyContent: "center",
    marginTop: "1.2rem",
  },
  destinoSelect: {
    background: "transparent",
    border: "none",
    color: "#A855F7",
    cursor: "pointer",
    fontSize: "0.88rem",
    fontWeight: 700,
    outline: "none",
  },
  heroPanel: {} as React.CSSProperties,
  panelLabel: {} as React.CSSProperties,
  heroSelect: {} as React.CSSProperties,
  panelDivider: {} as React.CSSProperties,
  panelCity: {} as React.CSSProperties,
  panelText: {} as React.CSSProperties,
  panelButton: {} as React.CSSProperties,
  chatSection: {
    alignItems: "stretch",
    background: "rgba(30, 27, 75, 0.5)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(168, 85, 247, 0.25)",
    borderRadius: "12px",
    boxShadow: "0 22px 52px rgba(46, 16, 101, 0.3)",
    display: "grid",
    gap: 0,
    gridTemplateColumns: "1fr",
    margin: "1.2rem 0 3rem",
    overflow: "hidden",
    padding: 0,
  },
  mobileFediButton: {
    background: "linear-gradient(135deg, #DB2777, #F97316)",
    border: "none",
    borderRadius: 999,
    bottom: 18,
    boxShadow: "0 16px 34px rgba(249, 115, 22, 0.4)",
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
    background: "rgba(46, 16, 101, 0.8)",
    border: "1px solid rgba(168, 85, 247, 0.4)",
    borderRadius: 999,
    color: "#e9d5ff",
    cursor: "pointer",
    display: "none",
    fontWeight: 900,
    padding: "0.45rem 0.7rem",
  },
  chatIntro: {
    alignItems: "center",
    background: "rgba(46, 16, 101, 0.4)",
    borderBottom: "1px solid rgba(168, 85, 247, 0.25)",
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
    background: "linear-gradient(135deg, #A855F7, #DB2777)",
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
    color: "#c4b5fd",
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
    background: "rgba(168, 85, 247, 0.12)",
    border: "1px solid rgba(168, 85, 247, 0.4)",
    borderRadius: "999px",
    color: "#e9d5ff",
    cursor: "pointer",
    fontSize: "0.86rem",
    fontWeight: 800,
    minHeight: 38,
    padding: "0.5rem 0.85rem",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  chatBox: {
    background: "rgba(13, 9, 32, 0.6)",
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
    background: "rgba(46, 16, 101, 0.6)",
    border: "1px solid rgba(168, 85, 247, 0.3)",
    color: "#e9d5ff",
  },
  chatBubbleUser: {
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, #A855F7, #DB2777)",
    color: "#ffffff",
  },
  chatCheck: {
    alignSelf: "flex-end",
    color: "#34d399",
    fontSize: "0.78rem",
    fontWeight: 900,
    lineHeight: 1,
  },
  chatForm: {
    borderTop: "1px solid rgba(168, 85, 247, 0.25)",
    display: "flex",
    gap: "0.75rem",
    padding: "1rem",
  },
  chatInput: {
    border: "1px solid rgba(168, 85, 247, 0.4)",
    borderRadius: "999px",
    flex: 1,
    fontSize: "0.95rem",
    minWidth: 0,
    padding: "0.95rem 1rem",
    background: "rgba(13, 9, 32, 0.6)",
    color: "#F3F4F6",
  },
  chatSendButton: {
    background: "linear-gradient(135deg, #DB2777, #F97316)",
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
    background: "linear-gradient(135deg, #A855F7, #DB2777)",
    border: "none",
    borderRadius: "999px",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "0.86rem",
    fontWeight: 800,
    padding: "0.52rem 0.68rem",
  },
  chatCartGhostButton: {
    background: "transparent",
    border: "1px solid rgba(168, 85, 247, 0.4)",
    borderRadius: "999px",
    color: "#c4b5fd",
    cursor: "pointer",
    fontSize: "0.86rem",
    fontWeight: 800,
    padding: "0.52rem 0.68rem",
  },
  chatCartMessage: {
    color: "#34d399",
    fontSize: "0.9rem",
    fontWeight: 700,
    margin: "0.65rem 0 0",
  },
  fediTools: {
    background: "rgba(46, 16, 101, 0.3)",
    borderTop: "1px solid rgba(168, 85, 247, 0.2)",
    padding: "0.9rem",
  },
  fediToolPanel: {
    background: "rgba(13, 9, 32, 0.5)",
    border: "1px solid rgba(168, 85, 247, 0.2)",
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
    color: "#A855F7",
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 900,
    marginBottom: "0.4rem",
    textTransform: "uppercase",
  },
  fediToolText: {
    color: "#9ca3af",
    fontSize: "0.9rem",
    lineHeight: 1.45,
    margin: "0 0 0.75rem",
  },
  publishBox: {
    display: "flex",
    gap: "0.75rem",
  },
  publishInput: {
    border: "1px solid rgba(168, 85, 247, 0.4)",
    borderRadius: "10px",
    flex: 1,
    minWidth: 0,
    minHeight: "38px",
    padding: "0.75rem",
    background: "rgba(13, 9, 32, 0.6)",
    color: "#F3F4F6",
  },
  publishButton: {
    background: "linear-gradient(135deg, #A855F7, #DB2777)",
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
    color: "#c4b5fd",
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
    background: "rgba(30, 27, 75, 0.5)",
    border: "1px solid rgba(168, 85, 247, 0.2)",
    borderRadius: "12px",
    boxShadow: "0 12px 28px rgba(46, 16, 101, 0.2)",
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
    color: "#F3F4F6",
    display: "block",
    fontSize: "1rem",
  },
  reviewCity: {
    color: "#A855F7",
    display: "block",
    fontSize: "0.86rem",
    fontWeight: 800,
    marginTop: "0.15rem",
  },
  reviewStars: {
    color: "#F97316",
    fontSize: "1rem",
    letterSpacing: "0.03em",
    whiteSpace: "nowrap",
  },
  reviewText: {
    color: "#9ca3af",
    lineHeight: 1.55,
    margin: 0,
  },
  stat: {
    background: "rgba(30, 27, 75, 0.5)",
    border: "1px solid rgba(168, 85, 247, 0.2)",
    borderRadius: "12px",
    boxShadow: "0 14px 32px rgba(46, 16, 101, 0.2)",
    padding: "1.5rem",
  },
  statNumber: {
    background: "linear-gradient(135deg, #A855F7, #DB2777)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "block",
    fontSize: "2.2rem",
    fontWeight: 900,
  },
  statText: {
    color: "#9ca3af",
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
    color: "#A855F7",
    display: "block",
    fontSize: "0.82rem",
    fontWeight: 800,
    letterSpacing: "0.04em",
    marginBottom: "0.35rem",
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: "#F3F4F6",
    fontSize: "2rem",
    lineHeight: 1.15,
    margin: 0,
  },
  linkButton: {
    background: "rgba(168, 85, 247, 0.1)",
    border: "1px solid rgba(168, 85, 247, 0.4)",
    borderRadius: "999px",
    color: "#c4b5fd",
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
    backgroundColor: "rgba(30, 27, 75, 0.6)",
    border: "1px solid rgba(168, 85, 247, 0.2)",
    borderRadius: "12px",
    cursor: "pointer",
    overflow: "hidden",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 18px 38px rgba(46, 16, 101, 0.3)",
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
    background: "rgba(168, 85, 247, 0.8)",
    backdropFilter: "blur(4px)",
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
    color: "#F3F4F6",
  },
  productRating: {
    alignItems: "center",
    color: "#9ca3af",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.88rem",
    gap: "0.45rem",
  },
  ratingStars: {
    color: "#F97316",
    fontSize: "1rem",
    letterSpacing: "0.03em",
  },
  cardDescription: {
    fontSize: "0.95rem",
    color: "#9ca3af",
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
    borderTop: "1px solid rgba(168, 85, 247, 0.15)",
  },
  price: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#F97316",
  },
  rating: {
    fontSize: "0.9rem",
    color: "#A855F7",
  },
  secondaryButton: {
    background: "linear-gradient(135deg, #DB2777, #F97316)",
    border: "none",
    borderRadius: "999px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    padding: "0.85rem 1rem",
  },
  splitSection: {
    alignItems: "start",
    background: "linear-gradient(135deg, #0D0920 0%, #2E1065 55%, #6b21a8 100%)",
    border: "1px solid rgba(168, 85, 247, 0.3)",
    borderRadius: "16px",
    color: "#fff",
    display: "grid",
    gap: "2.5rem",
    gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
    marginBottom: "3rem",
    padding: "2.5rem 2rem",
  },
  storyBlock: {
    maxWidth: "460px",
  },
  storyText: {
    color: "#c4b5fd",
    lineHeight: 1.65,
    marginTop: "1rem",
    marginBottom: "1.75rem",
    fontSize: "1.02rem",
  },
  storyBtn: {
    background: "linear-gradient(135deg, #DB2777, #F97316)",
    border: "none",
    borderRadius: "999px",
    boxShadow: "0 6px 20px rgba(219,39,119,0.4)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 800,
    padding: "0.8rem 1.6rem",
  },
  steps: {
    display: "grid",
    gap: "0.85rem",
  },
  step: {
    alignItems: "start",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(168, 85, 247, 0.22)",
    borderRadius: "12px",
    display: "flex",
    gap: "1.25rem",
    padding: "1.25rem 1.5rem",
    backdropFilter: "blur(6px)",
  },
  stepNumber: {
    alignItems: "center",
    background: "linear-gradient(135deg, #DB2777, #F97316)",
    borderRadius: "10px",
    color: "#fff",
    display: "inline-flex",
    flexShrink: 0,
    fontSize: "1rem",
    fontWeight: 900,
    height: "44px",
    justifyContent: "center",
    minWidth: "44px",
  },
  stepTitle: {
    fontSize: "1.05rem",
    fontWeight: 800,
    margin: 0,
    color: "#F3F4F6",
  },
  stepText: {
    color: "#c4b5fd",
    lineHeight: 1.55,
    margin: "0.3rem 0 0",
    fontSize: "0.9rem",
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
    background: "rgba(30, 27, 75, 0.5)",
    border: "1px solid rgba(168, 85, 247, 0.2)",
    borderRadius: "12px",
    color: "#F3F4F6",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    minHeight: "140px",
    padding: "1.45rem",
    textAlign: "left",
    transition: "border-color 0.2s, background 0.2s",
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
    background: "rgba(30, 27, 75, 0.5)",
    border: "1px solid rgba(168, 85, 247, 0.2)",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "1.1rem",
  },
  communityBadge: {
    alignSelf: "flex-start",
    background: "rgba(219, 39, 119, 0.15)",
    borderRadius: "999px",
    color: "#FB7185",
    fontSize: "0.8rem",
    fontWeight: 800,
    padding: "0.35rem 0.65rem",
  },
  communityTitle: {
    color: "#F3F4F6",
    fontSize: "1.15rem",
    margin: 0,
  },
  communityText: {
    color: "#9ca3af",
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
    borderTop: "1px solid rgba(168, 85, 247, 0.15)",
    display: "flex",
    justifyContent: "space-between",
    gap: "0.75rem",
    marginTop: "auto",
    paddingTop: "0.75rem",
  },
  smallGhostButton: {
    background: "transparent",
    border: "1px solid rgba(168, 85, 247, 0.4)",
    borderRadius: "6px",
    color: "#c4b5fd",
    cursor: "pointer",
    fontWeight: 800,
    marginRight: "0.45rem",
    padding: "0.55rem 0.75rem",
  },
  smallPrimaryButton: {
    background: "linear-gradient(135deg, #A855F7, #DB2777)",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    padding: "0.55rem 0.75rem",
  },
  ctaBand: {
    alignItems: "center",
    background: "linear-gradient(135deg, rgba(46, 16, 101, 0.6), rgba(219, 39, 119, 0.25))",
    border: "1px solid rgba(168, 85, 247, 0.3)",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "2rem",
  },
  ctaKicker: {
    color: "#A855F7",
    fontWeight: 800,
  },
  ctaTitle: {
    color: "#F3F4F6",
    fontSize: "1.7rem",
    margin: "0.35rem 0 0",
  },
  ctaButton: {
    background: "linear-gradient(135deg, #DB2777, #F97316)",
    border: "none",
    borderRadius: "999px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    padding: "1rem 1.55rem",
    boxShadow: "0 8px 24px rgba(249, 115, 22, 0.35)",
  },
  loading: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "2rem",
    color: "#9ca3af",
  },
  empty: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "2rem",
    color: "#6b7280",
  },
  miniCard: {
    background: "rgba(20, 16, 45, 0.75)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(168, 85, 247, 0.18)",
    borderRadius: "14px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    minHeight: 140,
    overflow: "hidden",
    padding: "1.2rem",
    position: "relative",
    transition: "border-color 0.2s, transform 0.2s",
  },
  miniCardGlow: {
    background: "radial-gradient(circle at 40% 55%, rgba(249,115,22,0.45), rgba(219,39,119,0.25) 50%, transparent 72%)",
    borderRadius: "50%",
    filter: "blur(18px)",
    height: "80px",
    left: "50%",
    position: "absolute",
    top: "30%",
    transform: "translateX(-50%)",
    width: "80px",
  },
  miniCardCategory: {
    color: "#A855F7",
    fontSize: "0.76rem",
    fontWeight: 800,
    letterSpacing: "0.04em",
    position: "relative",
    textTransform: "uppercase",
    zIndex: 1,
  },
  miniCardTitle: {
    color: "#F3F4F6",
    fontSize: "1rem",
    fontWeight: 700,
    lineHeight: 1.3,
    position: "relative",
    zIndex: 1,
  },
  miniCardPrice: {
    color: "#F97316",
    fontSize: "0.9rem",
    fontWeight: 700,
    marginTop: "auto",
    position: "relative",
    zIndex: 1,
  },
};

export default Home;
