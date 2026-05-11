import React from "react";
import { Link } from "react-router-dom";

const contractGuides = [
    {
        title: "Modificación sustancial del contrato",
        badge: "Cambios relevantes",
        items: [
            "Puede afectar a jornada, horario, turnos, salario, funciones o sistema de trabajo.",
            "Debe existir causa económica, técnica, organizativa o productiva.",
            "La empresa debe comunicarlo por escrito y con antelación legal.",
            "El trabajador puede aceptar, impugnar o extinguir el contrato con indemnización si procede.",
        ],
    },
    {
        title: "Despido objetivo",
        badge: "Extinción del contrato",
        items: [
            "Debe basarse en causas objetivas: económicas, técnicas, organizativas, productivas o ineptitud sobrevenida.",
            "Requiere carta escrita con causa concreta y fecha de efectos.",
            "Con carácter general, incluye preaviso e indemnización legal.",
            "Puede reclamarse si no cumple causa, forma o garantías legales.",
        ],
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
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem",
    },
    infoCard: {
        padding: "1.5rem",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #dbe4ef",
        borderRadius: "8px",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
    },
    badge: {
        display: "inline-block",
        marginBottom: "0.85rem",
        padding: "0.25rem 0.55rem",
        background: "#ecfeff",
        color: "#0f766e",
        border: "1px solid #99f6e4",
        borderRadius: "999px",
        fontSize: "0.8rem",
        fontWeight: 800,
    },
    cardTitle: {
        margin: "0 0 1rem 0",
        fontSize: "1.2rem",
        fontWeight: 800,
        color: "#172033",
    },
    checklist: {
        display: "grid",
        gap: "0.75rem",
        margin: 0,
        padding: 0,
        listStyle: "none",
    },
    checklistItem: {
        display: "grid",
        gridTemplateColumns: "2rem 1fr",
        gap: "0.65rem",
        alignItems: "start",
        color: "#475569",
    },
    step: {
        display: "grid",
        placeItems: "center",
        width: "2rem",
        height: "2rem",
        background: "#dbeafe",
        color: "#1d4ed8",
        borderRadius: "8px",
        fontWeight: 800,
        lineHeight: 1,
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

function WorksCouncilContractInfo() {
    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>
                ← Volver al Comité de Empresa
            </Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Información sobre Contratos</h2>
                <p style={styles.heroText}>
                    Guía práctica sobre modificaciones y extinción del contrato laboral.
                </p>
            </section>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Infografías: modificación y extinción del contrato</h3>
                <p style={styles.text}>
                    Resumen práctico sobre cambios laborales relevantes y despido objetivo, con los pasos que debe revisar una persona trabajadora.
                </p>
            </section>

            <section style={styles.section}>
                <div style={styles.infoGrid}>
                    {contractGuides.map((guide) => (
                        <article key={guide.title} style={styles.infoCard}>
                            <span style={styles.badge}>{guide.badge}</span>
                            <h4 style={styles.cardTitle}>{guide.title}</h4>
                            <ol style={styles.checklist}>
                                {guide.items.map((item, index) => (
                                    <li key={item} style={styles.checklistItem}>
                                        <span style={styles.step}>{index + 1}</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ol>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default WorksCouncilContractInfo;
