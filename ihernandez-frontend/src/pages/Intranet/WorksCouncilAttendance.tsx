import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../UserContext";

type Fichaje = {
    id: number;
    tipo: string;
    created_at: string;
};

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: "1200px", margin: "0 auto", padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.6, color: "#172033" },
    hero: { marginBottom: "2rem", padding: "2rem", background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)", color: "white", borderRadius: "8px", boxShadow: "0 18px 45px rgba(37, 99, 235, 0.22)" },
    title: { fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, margin: "0 0 0.75rem 0" },
    heroText: { fontSize: "1.125rem", margin: 0, opacity: 0.95 },
    backLink: { display: "inline-block", marginBottom: "2rem", padding: "0.5rem 1rem", background: "#f3f4f6", color: "#374151", textDecoration: "none", borderRadius: "6px", fontWeight: 500 },
    btnRow: { display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" as const },
    btnIn: { padding: "0.85rem 2rem", background: "linear-gradient(135deg, #0f766e, #14b8a6)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 800, fontSize: "1rem", cursor: "pointer" },
    btnOut: { padding: "0.85rem 2rem", background: "linear-gradient(135deg, #dc2626, #f97316)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 800, fontSize: "1rem", cursor: "pointer" },
    table: { width: "100%", borderCollapse: "collapse" as const, background: "#fff", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
    th: { background: "#f8fafc", padding: "0.9rem 1rem", textAlign: "left" as const, fontWeight: 800, fontSize: "0.85rem", color: "#374151", borderBottom: "2px solid #e2e8f0" },
    td: { padding: "0.85rem 1rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.93rem", color: "#374151" },
    badge: (tipo: string): React.CSSProperties => ({
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        borderRadius: "999px",
        fontWeight: 800,
        fontSize: "0.82rem",
        background: tipo === "entrada" ? "#dcfce7" : "#fee2e2",
        color: tipo === "entrada" ? "#166534" : "#991b1b",
    }),
    empty: { textAlign: "center" as const, color: "#94a3b8", padding: "3rem 1rem", fontSize: "1rem" },
    toast: { background: "#dcfce7", border: "1px solid #86efac", borderRadius: "8px", padding: "0.85rem 1.25rem", color: "#166534", fontWeight: 700, marginBottom: "1.5rem" },
};

function fmt(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function WorksCouncilAttendance() {
    const { user } = useUser();
    const [fichajes, setFichajes] = useState<Fichaje[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");

    const load = () => {
        setLoading(true);
        fetch("/api/fichajes", { credentials: "include" })
            .then(r => r.json())
            .then(data => setFichajes(Array.isArray(data) ? data : []))
            .catch(() => setFichajes([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const fichar = async (tipo: "entrada" | "salida") => {
        const res = await fetch(`/api/fichajes/clock-${tipo === "entrada" ? "in" : "out"}`, {
            method: "POST",
            credentials: "include",
        });
        if (res.ok) {
            setToast(tipo === "entrada" ? "✅ Entrada registrada correctamente." : "✅ Salida registrada correctamente.");
            setTimeout(() => setToast(""), 4000);
            load();
        }
    };

    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>← Volver al Comité de Empresa</Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Historial de Fichajes</h2>
                <p style={styles.heroText}>Registra tu entrada y salida, y consulta tu historial completo de jornadas.</p>
            </section>

            {toast && <div style={styles.toast}>{toast}</div>}

            {user && (
                <div style={styles.btnRow}>
                    <button style={styles.btnIn} onClick={() => fichar("entrada")}>🟢 Registrar Entrada</button>
                    <button style={styles.btnOut} onClick={() => fichar("salida")}>🔴 Registrar Salida</button>
                </div>
            )}

            {loading ? (
                <p style={styles.empty}>Cargando fichajes...</p>
            ) : fichajes.length === 0 ? (
                <p style={styles.empty}>No hay fichajes registrados todavía.</p>
            ) : (
                <div style={{ overflowX: "auto" as const }}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>#</th>
                                <th style={styles.th}>Tipo</th>
                                <th style={styles.th}>Fecha y hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fichajes.map((f, i) => (
                                <tr key={f.id}>
                                    <td style={{ ...styles.td, color: "#94a3b8" }}>{i + 1}</td>
                                    <td style={styles.td}><span style={styles.badge(f.tipo)}>{f.tipo}</span></td>
                                    <td style={styles.td}>{fmt(f.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default WorksCouncilAttendance;
