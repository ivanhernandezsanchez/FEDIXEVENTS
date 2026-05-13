import React from "react";
import { Link } from "react-router-dom";

const permisos = [
    { motivo: "Matrimonio o pareja de hecho", dias: "15 días naturales", retribuido: true, nota: "A partir del día del hecho causante." },
    { motivo: "Nacimiento o adopción de hijo/a", dias: "16 semanas (progenitor/a)", retribuido: true, nota: "Ampliable 2 semanas por discapacidad o parto múltiple." },
    { motivo: "Fallecimiento de cónyuge, hijo/a o padre/madre", dias: "4 días hábiles", retribuido: true, nota: "6 días si requiere desplazamiento superior a 200 km." },
    { motivo: "Fallecimiento de familiar 2.º grado (abuelos, hermanos, cuñados)", dias: "2 días hábiles", retribuido: true, nota: "4 días si hay desplazamiento." },
    { motivo: "Enfermedad grave u hospitalización de familiar", dias: "2 días hábiles", retribuido: true, nota: "4 días si hay desplazamiento." },
    { motivo: "Mudanza del domicilio habitual", dias: "1 día", retribuido: true, nota: "Aplicable una vez al año." },
    { motivo: "Cargo público o función sindical", dias: "Tiempo necesario", retribuido: true, nota: "Según normativa electoral o sindical aplicable." },
    { motivo: "Exámenes prenatales y técnicas de preparación al parto", dias: "Tiempo necesario", retribuido: true, nota: "Para la trabajadora gestante." },
    { motivo: "Exámenes oficiales y pruebas de liberación", dias: "Tiempo de examen", retribuido: true, nota: "Debe acreditarse matrícula oficial." },
    { motivo: "Visita médica propia", dias: "Tiempo necesario", retribuido: true, nota: "Según convenio; debe justificarse con volante." },
    { motivo: "Lactancia (menores de 9 meses)", dias: "1 hora diaria", retribuido: true, nota: "Puede sustituirse por reducción de jornada de 30 min o acumularse en jornadas completas." },
    { motivo: "Violencia de género", dias: "Flexible", retribuido: true, nota: "Reducción/reordenación de jornada, movilidad geográfica o suspensión con reserva de puesto." },
];

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: "1200px", margin: "0 auto", padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.6, color: "#172033" },
    hero: { marginBottom: "2rem", padding: "2rem", background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)", color: "white", borderRadius: "8px", boxShadow: "0 18px 45px rgba(37, 99, 235, 0.22)" },
    title: { fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, margin: "0 0 0.75rem 0" },
    heroText: { fontSize: "1.125rem", margin: 0, opacity: 0.95 },
    backLink: { display: "inline-block", marginBottom: "2rem", padding: "0.5rem 1rem", background: "#f3f4f6", color: "#374151", textDecoration: "none", borderRadius: "6px", fontWeight: 500 },
    note: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "1rem 1.25rem", color: "#1e40af", fontSize: "0.9rem", marginBottom: "1.5rem" },
    table: { width: "100%", borderCollapse: "collapse" as const, background: "#fff", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
    th: { background: "#f8fafc", padding: "0.9rem 1rem", textAlign: "left" as const, fontWeight: 800, fontSize: "0.85rem", color: "#374151", borderBottom: "2px solid #e2e8f0" },
    td: { padding: "0.9rem 1rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.93rem", color: "#374151", verticalAlign: "top" as const },
    badge: { display: "inline-block", background: "#dcfce7", color: "#166534", fontWeight: 800, fontSize: "0.8rem", padding: "0.2rem 0.6rem", borderRadius: "999px" },
};

function WorksCouncilPaidLeave() {
    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>← Volver al Comité de Empresa</Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Guía de Permisos Retribuidos</h2>
                <p style={styles.heroText}>Todos los permisos laborales a los que tienes derecho según el Estatuto de los Trabajadores y el convenio colectivo.</p>
            </section>

            <div style={styles.note}>
                ℹ️ Todos los permisos son retribuidos: durante su disfrute cobras tu salario habitual. Debes avisar con antelación razonable y justificar el motivo salvo causa de fuerza mayor.
            </div>

            <div style={{ overflowX: "auto" as const }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Motivo</th>
                            <th style={styles.th}>Duración</th>
                            <th style={styles.th}>Retribuido</th>
                            <th style={styles.th}>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {permisos.map((p) => (
                            <tr key={p.motivo}>
                                <td style={{ ...styles.td, fontWeight: 700 }}>{p.motivo}</td>
                                <td style={{ ...styles.td, fontWeight: 700, color: "#0f766e", whiteSpace: "nowrap" as const }}>{p.dias}</td>
                                <td style={styles.td}><span style={styles.badge}>Sí</span></td>
                                <td style={{ ...styles.td, color: "#64748b" }}>{p.nota}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "1rem" }}>
                Fuente: Art. 37 del Estatuto de los Trabajadores. El convenio colectivo puede ampliar estos derechos. Ante cualquier duda, consulta al comité de empresa.
            </p>
        </div>
    );
}

export default WorksCouncilPaidLeave;
