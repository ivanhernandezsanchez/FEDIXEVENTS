import React from "react";
import { Link } from "react-router-dom";

const legalLinks = [
    {
        title: "Convenio colectivo estatal del sector de Agencias de Viajes",
        detail: "Marco sectorial recomendado para una empresa de organización de experiencias y viajes.",
        href: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-18929",
    },
    {
        title: "Estatuto de los Trabajadores",
        detail: "Derechos básicos, jornada, salario, modificación del contrato y despidos.",
        href: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430",
    },
    {
        title: "Ley Orgánica de Libertad Sindical",
        detail: "Derecho de sindicación y representación de los trabajadores.",
        href: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-16660",
    },
    {
        title: "Ley de Prevención de Riesgos Laborales",
        detail: "Medidas de seguridad, salud laboral y obligaciones preventivas.",
        href: "https://www.boe.es/buscar/act.php?id=BOE-A-1995-24292",
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
    highlight: {
        background: "linear-gradient(135deg, #fffbeb 0%, #ecfeff 100%)",
        padding: "1.5rem",
        borderRadius: "8px",
        border: "1px solid #facc15",
        marginBottom: "2rem",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.07)",
    },
    highlightTitle: {
        display: "block",
        color: "#92400e",
        fontSize: "0.9rem",
        fontWeight: 800,
        marginBottom: "0.35rem",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
    },
    linkGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1rem",
    },
    legalLink: {
        display: "block",
        padding: "1.5rem",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #dbe4ef",
        borderRadius: "8px",
        textDecoration: "none",
        color: "inherit",
        transition: "all 0.2s",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
    },
    legalTitle: {
        display: "block",
        fontSize: "1.05rem",
        fontWeight: 800,
        marginBottom: "0.4rem",
        color: "#172033",
    },
    legalDetail: {
        display: "block",
        color: "#64748b",
        marginBottom: "1rem",
    },
    external: {
        color: "#2563eb",
        fontWeight: 700,
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

function WorksCouncilLegal() {
    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>
                ← Volver al Comité de Empresa
            </Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Normativa Laboral</h2>
                <p style={styles.heroText}>
                    Consulta la normativa básica que regula las condiciones de trabajo.
                </p>
            </section>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Convenio de aplicación, Estatuto de los Trabajadores y leyes importantes</h3>
                <p style={styles.text}>
                    La plantilla puede consultar aquí la normativa básica para entender permisos, jornada, clasificación profesional, representación, prevención y derechos colectivos.
                </p>
            </section>

            <section style={styles.section}>
                <div style={styles.highlight}>
                    <strong style={styles.highlightTitle}>Píldora del convenio</strong>
                    <p style={{ margin: 0, color: "#334155" }}>
                        El convenio colectivo ayuda a localizar salarios, grupos profesionales, jornada, vacaciones, permisos, formación y reglas de organización propias del sector.
                    </p>
                </div>

                <div style={styles.linkGrid}>
                    {legalLinks.map((link) => (
                        <a key={link.href} href={link.href} target="_blank" rel="noreferrer" style={styles.legalLink}>
                            <strong style={styles.legalTitle}>{link.title}</strong>
                            <span style={styles.legalDetail}>{link.detail}</span>
                            <span style={styles.external}>Consultar en BOE →</span>
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default WorksCouncilLegal;
