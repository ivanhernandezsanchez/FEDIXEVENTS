import React, { useState } from "react";
import { Link } from "react-router-dom";

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: "1200px", margin: "0 auto", padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.6, color: "#172033" },
    hero: { marginBottom: "2rem", padding: "2rem", background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)", color: "white", borderRadius: "8px", boxShadow: "0 18px 45px rgba(37, 99, 235, 0.22)" },
    title: { fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, margin: "0 0 0.75rem 0" },
    heroText: { fontSize: "1.125rem", margin: 0, opacity: 0.95 },
    backLink: { display: "inline-block", marginBottom: "2rem", padding: "0.5rem 1rem", background: "#f3f4f6", color: "#374151", textDecoration: "none", borderRadius: "6px", fontWeight: 500 },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" },
    card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "2rem", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" },
    label: { display: "block", fontWeight: 700, marginBottom: "0.4rem", color: "#374151", fontSize: "0.9rem" },
    input: { width: "100%", padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.95rem", fontFamily: "inherit", boxSizing: "border-box" as const },
    select: { width: "100%", padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.95rem", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" as const },
    resultCard: { background: "linear-gradient(135deg, #0f766e, #2563eb)", color: "#fff", borderRadius: "10px", padding: "2rem" },
    resultRow: { display: "flex", justifyContent: "space-between" as const, alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid rgba(255,255,255,0.15)" },
    resultTotal: { display: "flex", justifyContent: "space-between" as const, alignItems: "center", padding: "1rem 0 0" },
    note: { background: "#fefce8", border: "1px solid #fde68a", borderRadius: "8px", padding: "1rem 1.25rem", color: "#92400e", fontSize: "0.88rem", marginTop: "1.5rem" },
};

type Motivo = "despido_improcedente" | "despido_objetivo" | "baja_voluntaria" | "mutuo_acuerdo";

const motivosDias: Record<Motivo, number> = {
    despido_improcedente: 33,
    despido_objetivo: 20,
    baja_voluntaria: 0,
    mutuo_acuerdo: 20,
};

const motivosLabel: Record<Motivo, string> = {
    despido_improcedente: "Despido improcedente (33 días/año)",
    despido_objetivo: "Despido objetivo (20 días/año)",
    baja_voluntaria: "Baja voluntaria (sin indemnización)",
    mutuo_acuerdo: "Mutuo acuerdo (negociable, base 20 días/año)",
};

function WorksCouncilSeverance() {
    const [salario, setSalario] = useState("");
    const [anos, setAnos] = useState("");
    const [meses, setMeses] = useState("0");
    const [motivo, setMotivo] = useState<Motivo>("despido_improcedente");
    const [vacaciones, setVacaciones] = useState("");
    const [pagas, setPagas] = useState("2");

    const salarioNum = parseFloat(salario) || 0;
    const anosNum = parseInt(anos) || 0;
    const mesesNum = parseInt(meses) || 0;
    const vacacionesNum = parseFloat(vacaciones) || 0;
    const pagasNum = parseInt(pagas) || 0;

    const diasAnio = motivosDias[motivo];
    const totalAnios = anosNum + mesesNum / 12;
    const salarioDia = salarioNum / 365;
    const indemnizacion = diasAnio > 0 ? Math.min(salarioDia * diasAnio * totalAnios, salarioDia * diasAnio * 20) : 0;
    const partePagas = pagasNum > 0 ? (salarioNum / pagasNum) * (new Date().getMonth() / 12) : 0;
    const vacacionesPte = vacacionesNum > 0 ? (salarioDia * vacacionesNum) : 0;
    const total = indemnizacion + partePagas + vacacionesPte;

    const show = salarioNum > 0 && (anosNum > 0 || mesesNum > 0);

    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>← Volver al Comité de Empresa</Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Calculadora de Finiquito</h2>
                <p style={styles.heroText}>Estima los conceptos principales de tu finiquito según tu situación laboral. Resultado orientativo.</p>
            </section>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <h3 style={{ margin: "0 0 1.5rem", fontWeight: 800, fontSize: "1.2rem" }}>Tus datos</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                        <div>
                            <label style={styles.label}>Salario bruto anual (€)</label>
                            <input type="number" style={styles.input} value={salario} onChange={e => setSalario(e.target.value)} placeholder="Ej: 24000" />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={styles.label}>Años trabajados</label>
                                <input type="number" style={styles.input} value={anos} onChange={e => setAnos(e.target.value)} placeholder="Ej: 3" min="0" />
                            </div>
                            <div>
                                <label style={styles.label}>Meses adicionales</label>
                                <select style={styles.select} value={meses} onChange={e => setMeses(e.target.value)}>
                                    {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i} meses</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={styles.label}>Motivo de extinción</label>
                            <select style={styles.select} value={motivo} onChange={e => setMotivo(e.target.value as Motivo)}>
                                {(Object.keys(motivosLabel) as Motivo[]).map(k => <option key={k} value={k}>{motivosLabel[k]}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Vacaciones pendientes (días)</label>
                            <input type="number" style={styles.input} value={vacaciones} onChange={e => setVacaciones(e.target.value)} placeholder="Ej: 8" min="0" />
                        </div>
                        <div>
                            <label style={styles.label}>Número de pagas extra al año</label>
                            <select style={styles.select} value={pagas} onChange={e => setPagas(e.target.value)}>
                                <option value="0">Sin pagas extra</option>
                                <option value="2">2 pagas extra</option>
                                <option value="4">4 pagas extra</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    {show ? (
                        <div style={styles.resultCard}>
                            <h3 style={{ margin: "0 0 1.5rem", fontWeight: 800, fontSize: "1.2rem" }}>Estimación del finiquito</h3>
                            <div style={styles.resultRow}>
                                <span>Indemnización</span>
                                <strong>{indemnizacion.toFixed(2)} €</strong>
                            </div>
                            <div style={styles.resultRow}>
                                <span>Parte proporcional de pagas</span>
                                <strong>{partePagas.toFixed(2)} €</strong>
                            </div>
                            <div style={styles.resultRow}>
                                <span>Vacaciones no disfrutadas</span>
                                <strong>{vacacionesPte.toFixed(2)} €</strong>
                            </div>
                            <div style={styles.resultTotal}>
                                <span style={{ fontSize: "1.1rem", fontWeight: 900 }}>TOTAL ESTIMADO</span>
                                <span style={{ fontSize: "1.6rem", fontWeight: 900 }}>{total.toFixed(2)} €</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ ...styles.card, textAlign: "center" as const, color: "#94a3b8", padding: "3rem" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧮</div>
                            <p>Rellena tus datos a la izquierda para ver la estimación.</p>
                        </div>
                    )}

                    <div style={styles.note}>
                        ⚠️ Esta calculadora ofrece una estimación orientativa. El finiquito real puede variar según convenio colectivo, acuerdos individuales o sentencia judicial. Consulta siempre con el comité o un asesor laboral.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorksCouncilSeverance;
