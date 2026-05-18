import React from "react";
import { Link } from "react-router-dom";

const holidays = [
    { date: "1 Ene", name: "Año Nuevo", type: "nacional" },
    { date: "6 Ene", name: "Reyes Magos", type: "nacional" },
    { date: "3 Abr", name: "Viernes Santo", type: "nacional" },
    { date: "1 May", name: "Día del Trabajador", type: "nacional" },
    { date: "15 Ago", name: "Asunción de la Virgen", type: "nacional" },
    { date: "12 Oct", name: "Día de la Hispanidad / Virgen del Pilar", type: "nacional" },
    { date: "1 Nov", name: "Todos los Santos", type: "nacional" },
    { date: "6 Dic", name: "Día de la Constitución", type: "nacional" },
    { date: "8 Dic", name: "Inmaculada Concepción", type: "nacional" },
    { date: "25 Dic", name: "Navidad", type: "nacional" },
    { date: "23 Abr", name: "San Jorge – Día de Aragón", type: "autonomico" },
    { date: "13 Oct", name: "Fiestas del Pilar (local Zaragoza)", type: "local" },
];

const vacationPeriods = [
    { period: "24 Dic – 2 Ene", label: "Navidad", days: 10, color: "#3b82f6" },
    { period: "14 Abr – 21 Abr", label: "Semana Santa", days: 5, color: "#8b5cf6" },
    { period: "1 Ago – 31 Ago", label: "Verano (rotativo)", days: 22, color: "#f97316" },
];

const shiftInfo = [
    { turno: "Mañana", horario: "08:00 – 16:00", dias: "L – V" },
    { turno: "Tarde", horario: "14:00 – 22:00", dias: "L – V" },
    { turno: "Partido", horario: "09:00 – 14:00 / 16:00 – 19:00", dias: "L – V" },
    { turno: "Fin de semana", horario: "10:00 – 18:00", dias: "S – D" },
];

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: "1200px", margin: "0 auto", padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.6, color: "#172033" },
    hero: { marginBottom: "2rem", padding: "2rem", background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)", color: "white", borderRadius: "8px", boxShadow: "0 18px 45px rgba(37, 99, 235, 0.22)" },
    title: { fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, margin: "0 0 0.75rem 0" },
    heroText: { fontSize: "1.125rem", margin: 0, opacity: 0.95 },
    section: { marginBottom: "2rem" },
    sectionTitle: { fontSize: "1.4rem", fontWeight: 700, margin: "0 0 1rem 0", color: "#1f2937" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" },
    card: { padding: "1rem 1.25rem", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
    backLink: { display: "inline-block", marginBottom: "2rem", padding: "0.5rem 1rem", background: "#f3f4f6", color: "#374151", textDecoration: "none", borderRadius: "6px", fontWeight: 500 },
    tag: (type: string): React.CSSProperties => ({
        display: "inline-block",
        padding: "0.2rem 0.55rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 800,
        marginBottom: "0.3rem",
        background: type === "nacional" ? "#dbeafe" : type === "autonomico" ? "#ede9fe" : "#fef3c7",
        color: type === "nacional" ? "#1e40af" : type === "autonomico" ? "#6d28d9" : "#92400e",
    }),
    shiftTable: { width: "100%", borderCollapse: "collapse" as const },
    th: { background: "#f8fafc", padding: "0.75rem 1rem", textAlign: "left" as const, fontWeight: 700, fontSize: "0.88rem", color: "#374151", borderBottom: "2px solid #e2e8f0" },
    td: { padding: "0.75rem 1rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.95rem", color: "#374151" },
    vacCard: { padding: "1.25rem", borderRadius: "8px", background: "#fff", border: "1px solid #e2e8f0", borderLeft: "4px solid", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
};

function WorksCouncilCalendar() {
    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>← Volver al Comité de Empresa</Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Calendario Laboral 2026</h2>
                <p style={styles.heroText}>Festivos, períodos de vacaciones y turnos publicados por el comité con 15 días de antelación.</p>
            </section>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Festivos nacionales, autonómicos y locales</h3>
                <div style={styles.grid}>
                    {holidays.map((h) => (
                        <div key={h.date} style={styles.card}>
                            <span style={styles.tag(h.type)}>{h.type}</span>
                            <div style={{ fontWeight: 800, fontSize: "1rem", color: "#172033" }}>{h.date}</div>
                            <div style={{ color: "#64748b", fontSize: "0.95rem" }}>{h.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Períodos de vacaciones colectivas</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
                    {vacationPeriods.map((v) => (
                        <div key={v.label} style={{ ...styles.vacCard, borderLeftColor: v.color }}>
                            <div style={{ fontWeight: 900, fontSize: "1.1rem", color: v.color }}>{v.label}</div>
                            <div style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "0.25rem" }}>{v.period}</div>
                            <div style={{ marginTop: "0.5rem", fontWeight: 700, color: "#172033" }}>{v.days} días laborables</div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Turnos de trabajo</h3>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                    <table style={styles.shiftTable}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Turno</th>
                                <th style={styles.th}>Horario</th>
                                <th style={styles.th}>Días</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shiftInfo.map((s) => (
                                <tr key={s.turno}>
                                    <td style={{ ...styles.td, fontWeight: 700 }}>{s.turno}</td>
                                    <td style={styles.td}>{s.horario}</td>
                                    <td style={styles.td}>{s.dias}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p style={{ color: "#6b7280", fontSize: "0.88rem", marginTop: "0.75rem" }}>
                    Los turnos se publican con un mínimo de 15 días de antelación según acuerdo del comité de enero 2026.
                </p>
            </section>
        </div>
    );
}

export default WorksCouncilCalendar;
