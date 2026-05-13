import React, { useState } from "react";
import { Link } from "react-router-dom";

const categories = ["Condiciones laborales", "Horarios y turnos", "Formación", "Prevención de riesgos", "Conciliación familiar", "Otro"];

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: "1200px", margin: "0 auto", padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.6, color: "#172033" },
    hero: { marginBottom: "2rem", padding: "2rem", background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)", color: "white", borderRadius: "8px", boxShadow: "0 18px 45px rgba(37, 99, 235, 0.22)" },
    title: { fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, margin: "0 0 0.75rem 0" },
    heroText: { fontSize: "1.125rem", margin: 0, opacity: 0.95 },
    backLink: { display: "inline-block", marginBottom: "2rem", padding: "0.5rem 1rem", background: "#f3f4f6", color: "#374151", textDecoration: "none", borderRadius: "6px", fontWeight: 500 },
    formCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "2rem", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", maxWidth: "700px" },
    label: { display: "block", fontWeight: 700, marginBottom: "0.4rem", color: "#374151", fontSize: "0.9rem" },
    input: { width: "100%", padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.95rem", fontFamily: "inherit", boxSizing: "border-box" as const, outline: "none" },
    textarea: { width: "100%", padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.95rem", fontFamily: "inherit", boxSizing: "border-box" as const, resize: "vertical" as const, minHeight: "140px", outline: "none" },
    select: { width: "100%", padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.95rem", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" as const },
    btn: { padding: "0.85rem 2rem", background: "linear-gradient(135deg, #0f766e, #2563eb)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "1rem", cursor: "pointer", marginTop: "0.5rem" },
    note: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "1rem 1.25rem", color: "#166534", fontSize: "0.9rem", marginBottom: "1.5rem" },
    success: { background: "#dcfce7", border: "1px solid #86efac", borderRadius: "10px", padding: "2rem", textAlign: "center" as const, color: "#166534" },
};

function WorksCouncilSuggestions() {
    const [category, setCategory] = useState("");
    const [message, setMessage] = useState("");
    const [anonymous, setAnonymous] = useState(true);
    const [name, setName] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>← Volver al Comité de Empresa</Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Buzón de Sugerencias</h2>
                <p style={styles.heroText}>Envía tus consultas, propuestas o inquietudes al comité de empresa de forma confidencial.</p>
            </section>

            {sent ? (
                <div style={styles.success}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.5rem" }}>¡Sugerencia enviada!</h3>
                    <p style={{ margin: "0 0 1.5rem" }}>El comité la revisará en los próximos días. Gracias por participar.</p>
                    <button style={styles.btn} onClick={() => { setSent(false); setMessage(""); setCategory(""); setName(""); }}>
                        Enviar otra sugerencia
                    </button>
                </div>
            ) : (
                <div style={styles.formCard}>
                    <div style={styles.note}>
                        🔒 Tu sugerencia es confidencial. El comité no comparte la identidad de quien escribe salvo que tú lo indiques.
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                            <label style={styles.label}>Categoría</label>
                            <select style={styles.select} value={category} onChange={e => setCategory(e.target.value)} required>
                                <option value="">Selecciona una categoría...</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={styles.label}>Tu sugerencia o consulta</label>
                            <textarea style={styles.textarea} value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe tu propuesta o duda con el mayor detalle posible..." required />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <input type="checkbox" id="anon" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer" }} />
                            <label htmlFor="anon" style={{ cursor: "pointer", fontWeight: 600, color: "#374151" }}>Enviar de forma anónima</label>
                        </div>

                        {!anonymous && (
                            <div>
                                <label style={styles.label}>Tu nombre (opcional)</label>
                                <input type="text" style={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="Nombre y apellidos" />
                            </div>
                        )}

                        <button type="submit" style={styles.btn}>Enviar sugerencia</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default WorksCouncilSuggestions;
