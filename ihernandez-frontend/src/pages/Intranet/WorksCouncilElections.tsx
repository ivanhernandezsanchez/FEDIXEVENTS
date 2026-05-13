import React from "react";
import { Link } from "react-router-dom";

const members = [
    { name: "María López Fernández", role: "Presidenta del Comité", since: "2024", sindical: "CCOO" },
    { name: "Carlos Martínez Ruiz", role: "Secretario", since: "2024", sindical: "UGT" },
    { name: "Ana García Torres", role: "Vocal — Salud Laboral", since: "2024", sindical: "CCOO" },
    { name: "José Sánchez Moreno", role: "Vocal — Formación", since: "2024", sindical: "Independiente" },
    { name: "Laura Pérez Díaz", role: "Vocal — Igualdad", since: "2024", sindical: "UGT" },
];

const timeline = [
    { date: "Oct 2023", event: "Preaviso electoral presentado ante la autoridad laboral." },
    { date: "Nov 2023", event: "Constitución de la mesa electoral y apertura del censo." },
    { date: "Dic 2023", event: "Presentación de candidaturas por parte de sindicatos y trabajadores." },
    { date: "15 Ene 2024", event: "Jornada de votación. Participación: 78% de la plantilla." },
    { date: "16 Ene 2024", event: "Escrutinio y proclamación de resultados." },
    { date: "22 Ene 2024", event: "Constitución formal del comité de empresa. Mandato: 4 años." },
];

const results = [
    { candidatura: "CCOO", votos: 34, escanos: 2, color: "#dc2626" },
    { candidatura: "UGT", votos: 28, escanos: 2, color: "#2563eb" },
    { candidatura: "Independientes", votos: 15, escanos: 1, color: "#0f766e" },
    { candidatura: "Nulos / Blancos", votos: 5, escanos: 0, color: "#94a3b8" },
];

const totalVotos = results.reduce((s, r) => s + r.votos, 0);

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: "1200px", margin: "0 auto", padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.6, color: "#172033" },
    hero: { marginBottom: "2rem", padding: "2rem", background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)", color: "white", borderRadius: "8px", boxShadow: "0 18px 45px rgba(37, 99, 235, 0.22)" },
    title: { fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, margin: "0 0 0.75rem 0" },
    heroText: { fontSize: "1.125rem", margin: 0, opacity: 0.95 },
    backLink: { display: "inline-block", marginBottom: "2rem", padding: "0.5rem 1rem", background: "#f3f4f6", color: "#374151", textDecoration: "none", borderRadius: "6px", fontWeight: 500 },
    section: { marginBottom: "2rem" },
    sectionTitle: { fontSize: "1.3rem", fontWeight: 800, margin: "0 0 1rem", color: "#1f2937" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" },
    memberCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
    avatar: { width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #0f766e, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.1rem", marginBottom: "0.75rem" },
    timeline: { position: "relative" as const, paddingLeft: "2rem" },
    timelineLine: { position: "absolute" as const, left: 7, top: 0, bottom: 0, width: 2, background: "#e2e8f0" },
    timelineItem: { position: "relative" as const, marginBottom: "1.25rem" },
    timelineDot: { position: "absolute" as const, left: -27, top: 4, width: 12, height: 12, borderRadius: "50%", background: "#0f766e", border: "2px solid #fff", boxShadow: "0 0 0 2px #0f766e" },
    resultBar: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", marginBottom: "0.75rem" },
};

function WorksCouncilElections() {
    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>← Volver al Comité de Empresa</Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Elecciones Sindicales</h2>
                <p style={styles.heroText}>Información sobre el proceso electoral, resultados de las últimas elecciones y composición actual del comité.</p>
            </section>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Composición actual del comité (mandato 2024–2028)</h3>
                <div style={styles.grid}>
                    {members.map((m) => (
                        <div key={m.name} style={styles.memberCard}>
                            <div style={styles.avatar}>{m.name.charAt(0)}</div>
                            <div style={{ fontWeight: 800, fontSize: "1rem", color: "#172033" }}>{m.name}</div>
                            <div style={{ fontSize: "0.88rem", color: "#0f766e", fontWeight: 700, margin: "0.2rem 0" }}>{m.role}</div>
                            <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>Desde {m.since} · {m.sindical}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Resultados electorales — Enero 2024</h3>
                {results.map((r) => (
                    <div key={r.candidatura} style={styles.resultBar}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <span style={{ fontWeight: 700, color: r.color }}>{r.candidatura}</span>
                            <span style={{ fontSize: "0.88rem", color: "#64748b" }}>{r.votos} votos · {r.escanos} escaño{r.escanos !== 1 ? "s" : ""}</span>
                        </div>
                        <div style={{ background: "#f1f5f9", borderRadius: "999px", height: 8 }}>
                            <div style={{ width: `${(r.votos / totalVotos) * 100}%`, background: r.color, borderRadius: "999px", height: 8, transition: "width 0.5s" }} />
                        </div>
                    </div>
                ))}
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.5rem" }}>Total votos emitidos: {totalVotos} · Participación: 78%</p>
            </section>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Cronología del proceso electoral</h3>
                <div style={styles.timeline}>
                    <div style={styles.timelineLine} />
                    {timeline.map((t, i) => (
                        <div key={i} style={styles.timelineItem}>
                            <div style={styles.timelineDot} />
                            <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f766e" }}>{t.date}</div>
                            <div style={{ color: "#374151", fontSize: "0.93rem" }}>{t.event}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 800, margin: "0 0 0.75rem", fontSize: "1.1rem" }}>Próximas elecciones</h3>
                <p style={{ margin: 0, color: "#64748b" }}>
                    El mandato actual finaliza en <strong>enero de 2028</strong>. El proceso electoral se iniciará con un preaviso de al menos 3 meses de antelación.
                    Cualquier trabajador/a con más de 1 mes de antigüedad puede presentar su candidatura.
                </p>
            </section>
        </div>
    );
}

export default WorksCouncilElections;
