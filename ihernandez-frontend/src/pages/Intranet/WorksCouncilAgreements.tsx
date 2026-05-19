import React from "react";
import { Link } from "react-router-dom";

const agreements = [
    {
        title: "Calendario de turnos publicado con 15 días de antelación",
        tag: "Organización del trabajo",
        date: "Enero 2026",
        text: "El comité ha acordado que los turnos de atención, reservas y soporte se publiquen con más margen para mejorar la conciliación.",
    },
    {
        title: "Bolsa anual de 20 horas de formación",
        tag: "Formación",
        date: "Febrero 2026",
        text: "La plantilla podrá usar horas remuneradas para formación relacionada con atención al cliente, prevención y herramientas digitales.",
    },
    {
        title: "Protocolo de comunicación ante cambios sustanciales",
        tag: "Modificación contractual",
        date: "Marzo 2026",
        text: "Cualquier cambio relevante de horario, funciones o sistema de trabajo tendrá una comunicación previa clara y documentada.",
    },
    {
        title: "Canal confidencial para consultas laborales",
        tag: "Participación",
        date: "Abril 2026",
        text: "Se habilita un buzón interno para trasladar dudas sobre nóminas, descansos, permisos y prevención de riesgos.",
    },
    {
        title: "Protocolo de teletrabajo aprobado: hasta 2 días semanales",
        tag: "Teletrabajo",
        date: "Mayo 2026",
        text: "Tras tres meses de negociación, la empresa ha aprobado el protocolo de teletrabajo que permite hasta 2 días semanales para los puestos elegibles. El comité supervisará su correcta aplicación.",
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
    newsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1rem",
    },
    newsCard: {
        padding: "1.5rem",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #dbe4ef",
        borderRadius: "8px",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
        position: "relative",
        overflow: "hidden",
    },
    tag: {
        display: "inline-block",
        background: "#dbeafe",
        color: "#1e40af",
        padding: "0.25rem 0.5rem",
        borderRadius: "999px",
        fontSize: "0.82rem",
        fontWeight: 800,
        marginBottom: "0.8rem",
    },
    date: {
        display: "block",
        color: "#0f766e",
        fontWeight: 800,
        fontSize: "0.85rem",
        marginBottom: "0.35rem",
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
    statusBar: {
        height: "4px",
        background: "linear-gradient(90deg, #14b8a6, #2563eb)",
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
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

function WorksCouncilAgreements() {
    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>
                ← Volver al Comité de Empresa
            </Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Acuerdos Conseguidos</h2>
                <p style={styles.heroText}>
                    Mejoras laborales logradas por el comité de empresa.
                </p>
            </section>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Acuerdos conseguidos</h3>
                <p style={styles.text}>Noticias internas sobre mejoras recientes de interés para la plantilla.</p>
            </section>

            <section style={styles.section}>
                <div style={styles.newsGrid}>
                    {agreements.map((item) => (
                        <article key={item.title} style={styles.newsCard}>
                            <span style={styles.statusBar} />
                            <span style={styles.tag}>{item.tag}</span>
                            <span style={styles.date}>{item.date}</span>
                            <h4 style={styles.cardTitle}>{item.title}</h4>
                            <p style={styles.cardText}>{item.text}</p>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default WorksCouncilAgreements;
