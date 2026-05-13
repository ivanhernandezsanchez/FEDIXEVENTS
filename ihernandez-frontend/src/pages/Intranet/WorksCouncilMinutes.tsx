import React, { useState } from "react";
import { Link } from "react-router-dom";

const minutes = [
    {
        date: "8 May 2026",
        title: "Reunión ordinaria mayo 2026",
        attendees: 7,
        agreements: [
            "Se aprueba el inicio formal de negociación del nuevo convenio colectivo.",
            "Se designa a María López como portavoz del comité ante la dirección.",
            "Se acuerda publicar un aviso sobre el derecho a la desconexión digital.",
        ],
        points: [
            "Revisión del acuerdo de teletrabajo aprobado en abril.",
            "Propuesta de ampliación de la bolsa de formación a 30 horas anuales.",
            "Consulta de trabajadores sobre el sistema de turnos en verano.",
        ],
        status: "aprobada",
    },
    {
        date: "3 Abr 2026",
        title: "Reunión extraordinaria — Protocolo teletrabajo",
        attendees: 6,
        agreements: [
            "Se aprueba el protocolo de teletrabajo (máx. 2 días/semana para puestos elegibles).",
            "Se establece un período de prueba de 3 meses antes de revisión definitiva.",
        ],
        points: [
            "Presentación del borrador del protocolo de teletrabajo por parte de RRHH.",
            "Debate sobre criterios de elegibilidad por puesto.",
            "Negociación del procedimiento de solicitud y revocación.",
        ],
        status: "aprobada",
    },
    {
        date: "6 Mar 2026",
        title: "Reunión ordinaria marzo 2026",
        attendees: 7,
        agreements: [
            "Se aprueba el protocolo de comunicación ante cambios sustanciales (acuerdo ya vigente).",
            "Se solicita a RRHH un informe sobre la distribución de turnos del primer trimestre.",
        ],
        points: [
            "Seguimiento de los acuerdos de enero y febrero.",
            "Consulta sobre el cambio de horario en el departamento de atención al cliente.",
            "Revisión del canal de consultas confidenciales.",
        ],
        status: "aprobada",
    },
    {
        date: "2 Feb 2026",
        title: "Reunión ordinaria febrero 2026",
        attendees: 5,
        agreements: [
            "Se aprueba la bolsa anual de 20 horas de formación remunerada.",
            "Se acuerda publicar el catálogo de cursos antes del 1 de abril.",
        ],
        points: [
            "Presentación de la oferta formativa para 2026.",
            "Debate sobre el procedimiento de solicitud de la bolsa de horas.",
        ],
        status: "aprobada",
    },
];

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: "1200px", margin: "0 auto", padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.6, color: "#172033" },
    hero: { marginBottom: "2rem", padding: "2rem", background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)", color: "white", borderRadius: "8px", boxShadow: "0 18px 45px rgba(37, 99, 235, 0.22)" },
    title: { fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, margin: "0 0 0.75rem 0" },
    heroText: { fontSize: "1.125rem", margin: 0, opacity: 0.95 },
    backLink: { display: "inline-block", marginBottom: "2rem", padding: "0.5rem 1rem", background: "#f3f4f6", color: "#374151", textDecoration: "none", borderRadius: "6px", fontWeight: 500 },
    card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "1.25rem", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" },
    header: { padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between" as const, alignItems: "center", cursor: "pointer", borderBottom: "1px solid #f1f5f9" },
    badge: { display: "inline-block", padding: "0.25rem 0.7rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 800, background: "#dcfce7", color: "#166534" },
    body: { padding: "1.5rem" },
    subTitle: { fontWeight: 800, fontSize: "0.9rem", color: "#374151", marginBottom: "0.6rem", textTransform: "uppercase" as const, letterSpacing: "0.04em" },
    list: { margin: "0 0 1.25rem", paddingLeft: "1.25rem", color: "#64748b", fontSize: "0.93rem" },
};

function WorksCouncilMinutes() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>← Volver al Comité de Empresa</Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Actas de Reuniones</h2>
                <p style={styles.heroText}>Resumen de los puntos tratados y acuerdos adoptados en cada reunión del comité de empresa.</p>
            </section>

            {minutes.map((m, i) => (
                <div key={i} style={styles.card}>
                    <div style={styles.header} onClick={() => setOpen(open === i ? null : i)}>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: "1.05rem", color: "#172033" }}>{m.title}</div>
                            <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.2rem" }}>
                                {m.date} · {m.attendees} asistentes
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={styles.badge}>{m.status}</span>
                            <span style={{ color: "#94a3b8", fontSize: "1.1rem" }}>{open === i ? "▲" : "▼"}</span>
                        </div>
                    </div>
                    {open === i && (
                        <div style={styles.body}>
                            <p style={styles.subTitle}>Puntos del orden del día</p>
                            <ul style={styles.list}>
                                {m.points.map((p, j) => <li key={j}>{p}</li>)}
                            </ul>
                            <p style={styles.subTitle}>Acuerdos adoptados</p>
                            <ul style={{ ...styles.list, color: "#166534" }}>
                                {m.agreements.map((a, j) => <li key={j}>{a}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default WorksCouncilMinutes;
