import React from "react";
import { Link } from "react-router-dom";

const styles: Record<string, React.CSSProperties> = {
    page: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "1rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        lineHeight: 1.6,
        color: "#172033",
    },
    hero: {
        marginBottom: "2rem",
        padding: "2rem",
        background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)",
        color: "white",
        borderRadius: "8px",
        boxShadow: "0 18px 45px rgba(37, 99, 235, 0.22)",
    },
    title: {
        fontSize: "clamp(2rem, 4vw, 3.2rem)",
        fontWeight: 700,
        margin: "0 0 0.75rem 0",
    },
    heroText: {
        fontSize: "1.125rem",
        margin: 0,
        opacity: 0.95,
        maxWidth: "780px",
    },
    heroStats: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "0.75rem",
        marginTop: "1.5rem",
    },
    stat: {
        padding: "0.85rem",
        background: "rgba(255, 255, 255, 0.16)",
        border: "1px solid rgba(255, 255, 255, 0.28)",
        borderRadius: "8px",
    },
    statValue: {
        display: "block",
        fontSize: "1.4rem",
        fontWeight: 800,
        lineHeight: 1.1,
    },
    statLabel: {
        display: "block",
        fontSize: "0.85rem",
        opacity: 0.9,
    },
    section: {
        marginBottom: "2rem",
    },
    sectionTitle: {
        fontSize: "1.5rem",
        fontWeight: 600,
        margin: "0 0 0.5rem 0",
        color: "#1f2937",
    },
    text: {
        color: "#6b7280",
        margin: 0,
    },
    categoryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem",
        marginTop: "1.5rem",
    },
    categoryCard: {
        padding: "1.5rem",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #dbe4ef",
        borderRadius: "8px",
        textDecoration: "none",
        color: "inherit",
        transition: "all 0.2s",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
        display: "flex",
        flexDirection: "column",
        minHeight: "180px",
    },
    categoryIcon: {
        fontSize: "2rem",
        width: "3.25rem",
        height: "3.25rem",
        display: "grid",
        placeItems: "center",
        marginBottom: "1rem",
        background: "#ecfeff",
        border: "1px solid #bae6fd",
        borderRadius: "8px",
    },
    categoryTitle: {
        fontSize: "1.25rem",
        fontWeight: 600,
        margin: "0 0 0.5rem 0",
    },
    categoryDescription: {
        margin: 0,
        color: "#6b7280",
        flex: 1,
    },
    cardFooter: {
        color: "#2563eb",
        fontWeight: 700,
        marginTop: "1rem",
    },
};

const categories = [
    { title: "¿Quiénes somos?", description: "Conoce al equipo que representa a los trabajadores y la función del comité de empresa.", icon: "👥", path: "/intranet/works-council/members" },
    { title: "Normativa Laboral", description: "Convenios colectivos, Estatuto de los Trabajadores y leyes importantes.", icon: "📋", path: "/intranet/works-council/legal" },
    { title: "Información sobre Contratos", description: "Guía sobre modificaciones y extinción del contrato laboral.", icon: "📄", path: "/intranet/works-council/contract-info" },
    { title: "Acuerdos Conseguidos", description: "Mejoras laborales logradas por el comité de empresa.", icon: "✅", path: "/intranet/works-council/agreements" },
    { title: "Objetivos para 2026", description: "Prioridades que el comité quiere negociar durante el próximo año.", icon: "🎯", path: "/intranet/works-council/objectives" },
    { title: "Calendario Laboral", description: "Festivos nacionales, autonómicos, locales, períodos de vacaciones y turnos publicados.", icon: "📅", path: "/intranet/works-council/calendar" },
    { title: "Buzón de Sugerencias", description: "Envía consultas, propuestas o inquietudes al comité de forma confidencial.", icon: "📬", path: "/intranet/works-council/suggestions" },
    { title: "Preguntas Frecuentes", description: "Respuestas a las dudas más comunes sobre derechos laborales, permisos y nóminas.", icon: "❓", path: "/intranet/works-council/faq" },
    { title: "Guía de Permisos Retribuidos", description: "Todos los permisos a los que tienes derecho: matrimonio, nacimiento, fallecimiento y más.", icon: "📝", path: "/intranet/works-council/paid-leave" },
{ title: "Calculadora de Finiquito", description: "Estima los conceptos de tu finiquito según tu antigüedad, salario y motivo de extinción.", icon: "🧮", path: "/intranet/works-council/severance" },
    { title: "Noticias y Avisos", description: "Tablón de novedades del comité: negociaciones, logros, convocatorias y comunicados.", icon: "📢", path: "/intranet/works-council/news" },
    { title: "Actas de Reuniones", description: "Puntos tratados y acuerdos adoptados en cada reunión del comité de empresa.", icon: "📃", path: "/intranet/works-council/minutes" },
    { title: "Elecciones Sindicales", description: "Proceso electoral, resultados de las últimas elecciones y composición del comité.", icon: "🗳️", path: "/intranet/works-council/elections" },
];

function WorksCouncil() {
    return (
        <div style={styles.page}>
            <section style={styles.hero}>
                <h2 style={styles.title}>Comité de empresa</h2>
                <p style={styles.heroText}>
                    Espacio informativo para que la plantilla conozca quién la representa, qué normas laborales se aplican y qué acuerdos se están trabajando.
                </p>
                <div style={styles.heroStats}>
                    <div style={styles.stat}>
                        <span style={styles.statValue}>13</span>
                        <span style={styles.statLabel}>áreas de consulta</span>
                    </div>
                    <div style={styles.stat}>
                        <span style={styles.statValue}>2026</span>
                        <span style={styles.statLabel}>objetivos activos</span>
                    </div>
                    <div style={styles.stat}>
                        <span style={styles.statValue}>24h</span>
                        <span style={styles.statLabel}>canal de dudas interno</span>
                    </div>
                </div>
            </section>

            <section style={styles.section}>
                <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 8px 32px rgba(15,23,42,0.12)", border: "1px solid #dbe4ef", marginBottom: "2rem" }}>
                    <img src="/comite.png" alt="Organigrama del Comité de Empresa" style={{ width: "100%", display: "block" }} />
                </div>
            </section>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Categorías</h3>
                <p style={styles.text}>
                    Explora las diferentes áreas de información del comité de empresa.
                </p>

                <div style={styles.categoryGrid}>
                    {categories.map((category) => (
                        <Link key={category.path} to={category.path} style={styles.categoryCard}>
                            <span style={styles.categoryIcon}>{category.icon}</span>
                            <h4 style={styles.categoryTitle}>{category.title}</h4>
                            <p style={styles.categoryDescription}>{category.description}</p>
                            <span style={styles.cardFooter}>Abrir apartado →</span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default WorksCouncil;
