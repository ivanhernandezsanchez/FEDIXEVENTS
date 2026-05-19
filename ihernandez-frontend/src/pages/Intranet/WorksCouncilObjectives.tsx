import React from "react";
import { Link } from "react-router-dom";

const objectives = [
    {
        title: "Plan de conciliación 2026",
        progress: 82,
        text: "Negociar medidas de flexibilidad horaria, permisos y teletrabajo parcial para puestos compatibles.",
    },
    {
        title: "Guía interna sobre cambios y extinción del contrato",
        progress: 60,
        text: "Crear una guía práctica para que cualquier trabajador entienda sus derechos ante modificaciones, despidos y fin de contrato.",
    },
    {
        title: "Mejora del calendario de formación",
        progress: 75,
        text: "Ordenar cursos por áreas, publicar convocatorias con más antelación y reservar plazas para nuevos perfiles.",
    },
    {
        title: "Revisión de descansos y turnos",
        progress: 50,
        text: "Analizar incidencias de carga de trabajo y proponer ajustes en picos de reservas y atención al cliente.",
    },
];

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
        margin: "0 0 1rem 0",
    },
    heroText: {
        fontSize: "1.125rem",
        margin: 0,
        opacity: 0.95,
        maxWidth: "760px",
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
    objectiveGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1rem",
    },
    objectiveCard: {
        padding: "1.5rem",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #dbe4ef",
        borderRadius: "8px",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
    },
    cardTitle: {
        margin: "0 0 0.5rem 0",
        fontSize: "1.125rem",
        fontWeight: 800,
        color: "#172033",
    },
    cardText: {
        margin: 0,
        color: "#64748b",
    },
    progressHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        marginTop: "1.25rem",
        color: "#475569",
        fontSize: "0.85rem",
        fontWeight: 800,
    },
    progressTrack: {
        height: "0.6rem",
        marginTop: "0.5rem",
        background: "#e2e8f0",
        borderRadius: "999px",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        background: "linear-gradient(90deg, #14b8a6, #2563eb)",
        borderRadius: "999px",
    },
    backLink: {
        display: "inline-block",
        marginBottom: "2rem",
        padding: "0.5rem 1rem",
        background: "#f3f4f6",
        color: "#374151",
        textDecoration: "none",
        borderRadius: "6px",
        fontWeight: 500,
    },
};

function WorksCouncilObjectives() {
    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>
                ← Volver al Comité de Empresa
            </Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Objetivos para 2026</h2>
                <p style={styles.heroText}>
                    Prioridades que el comité quiere negociar durante el próximo año.
                </p>
            </section>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Objetivos para 2026</h3>
                <p style={styles.text}>Prioridades que el comité quiere negociar durante el próximo año.</p>
            </section>

            <section style={styles.section}>
                <div style={styles.objectiveGrid}>
                    {objectives.map((objective) => (
                        <article key={objective.title} style={styles.objectiveCard}>
                            <h4 style={styles.cardTitle}>{objective.title}</h4>
                            <p style={styles.cardText}>{objective.text}</p>
                            <div style={styles.progressHeader}>
                                <span>Avance de negociación</span>
                                <span>{objective.progress}%</span>
                            </div>
                            <div style={styles.progressTrack}>
                                <div style={{ ...styles.progressFill, width: `${objective.progress}%` }} />
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default WorksCouncilObjectives;
