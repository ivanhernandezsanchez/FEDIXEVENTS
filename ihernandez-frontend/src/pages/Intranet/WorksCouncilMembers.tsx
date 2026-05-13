import React from "react";
import { Link } from "react-router-dom";

const committeeMembers = [
    { name: "Laura Martín", role: "Presidenta", area: "Coordinación general y relación con dirección", initials: "LM" },
    { name: "Iván Hernández", role: "Secretario", area: "Actas, convocatorias y documentación", initials: "IH" },
    { name: "Marta Ruiz", role: "Delegada de igualdad", area: "Igualdad, conciliación y prevención", initials: "MR" },
    { name: "Pablo Gómez", role: "Vocal", area: "Formación, horarios y turnos", initials: "PG" },
    { name: "Nerea Santos", role: "Vocal", area: "Comunicación con trabajadores", initials: "NS" },
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
    introPanel: {
        display: "grid",
        gridTemplateColumns: "1.2fr 0.8fr",
        gap: "1rem",
        padding: "1.25rem",
        background: "#f8fafc",
        border: "1px solid #dbe4ef",
        borderRadius: "8px",
    },
    quickList: {
        margin: 0,
        paddingLeft: "1.2rem",
        color: "#334155",
    },
    orgChart: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1rem",
        marginTop: "1rem",
    },
    memberCard: {
        padding: "1.5rem",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #dbe4ef",
        borderRadius: "8px",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
    },
    memberLead: {
        borderColor: "#14b8a6",
        background: "#f0fdfa",
    },
    avatar: {
        width: "3.25rem",
        height: "3.25rem",
        display: "grid",
        placeItems: "center",
        marginBottom: "1rem",
        background: "#0f766e",
        color: "white",
        borderRadius: "8px",
        fontWeight: 800,
    },
    role: {
        display: "inline-block",
        marginBottom: "0.35rem",
        color: "#0f766e",
        fontWeight: 800,
        fontSize: "0.85rem",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
    },
    name: {
        display: "block",
        fontSize: "1.2rem",
        fontWeight: 800,
        color: "#172033",
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

function WorksCouncilMembers() {
    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>
                ← Volver al Comité de Empresa
            </Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>¿Quiénes somos?</h2>
                <p style={styles.heroText}>
                    Conoce al equipo que representa a los trabajadores en la empresa.
                </p>
            </section>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Comité de Empresa</h3>
                <div style={styles.introPanel}>
                    <p style={styles.text}>
                        El comité de empresa es el órgano de representación colectiva de los trabajadores en empresas de 50 o más personas. Sirve para defender intereses laborales, recibir información de la empresa, participar en consultas, proponer mejoras y acompañar a la plantilla ante dudas sobre condiciones de trabajo.
                    </p>
                    <ul style={styles.quickList}>
                        <li>Escucha consultas de la plantilla.</li>
                        <li>Revisa cambios organizativos relevantes.</li>
                        <li>Propone mejoras de conciliación y seguridad.</li>
                    </ul>
                </div>
            </section>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Miembros del Comité</h3>
<div style={styles.orgChart}>
                    {committeeMembers.map((member, index) => (
                        <article key={member.name} style={{ ...styles.memberCard, ...(index === 0 ? styles.memberLead : {}) }}>
                            <span style={styles.avatar}>{member.initials}</span>
                            <strong style={styles.role}>{member.role}</strong>
                            <span style={styles.name}>{member.name}</span>
                            <p style={styles.text}>{member.area}</p>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default WorksCouncilMembers;
