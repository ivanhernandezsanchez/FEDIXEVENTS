import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface Fichaje {
    id?: number;
    created_at?: string;
    fecha?: string;
    tipo: string;
}

function Dashboard() {
    const navigate = useNavigate();
    const [fichajes, setFichajes] = useState<Fichaje[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const formatDate = (value?: string) => value ? new Date(value).toLocaleString() : "-";

    const fetchFichajes = useCallback(async () => {
        setError("");
        try {
            const res = await fetch("/api/fichajes", {
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "No se pudieron cargar los fichajes");
                if (res.status === 401) {
                    navigate("/intranet/login");
                }
                return;
            }

            if (Array.isArray(data)) setFichajes(data);
        } catch (e) {
            console.error(e);
            setError("Error al conectar con el servidor de fichajes");
        }
    }, [navigate]);

    const handleClockIn = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/fichajes/clock-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Error al registrar la entrada");
                if (res.status === 401) {
                    navigate("/intranet/login");
                }
            } else {
                await fetchFichajes();
            }
        } catch (e) {
            console.error(e);
            setError("Error de red al registrar la entrada");
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/fichajes/clock-out", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Error al registrar la salida");
                if (res.status === 401) {
                    navigate("/intranet/login");
                }
            } else {
                await fetchFichajes();
            }
        } catch (e) {
            console.error(e);
            setError("Error de red al registrar la salida");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFichajes();
    }, [fetchFichajes]);

    return (
        <div style={styles.page}>
            <section style={styles.header}>
                <div>
                    <span style={styles.kicker}>Operaciones</span>
                    <h2 style={styles.title}>Dashboard & Fichajes</h2>
                    <p style={styles.muted}>Control de jornada y accesos internos del equipo.</p>
                </div>
                <div style={styles.statCard}>
                    <strong>{fichajes.length}</strong>
                    <span>registros</span>
                </div>
            </section>

            <div style={styles.actions}>
                <button onClick={handleClockIn} disabled={loading} style={{ ...styles.actionButton, background: "#059669", opacity: loading ? 0.7 : 1 }}>
                    Entrada
                </button>
                <button onClick={handleClockOut} disabled={loading} style={{ ...styles.actionButton, background: "#dc2626", opacity: loading ? 0.7 : 1 }}>
                    Salida
                </button>
            </div>

            {error && <p style={{ color: "#b91c1c", marginTop: 10 }}>{error}</p>}

            <h3 style={styles.sectionTitle}>Mi historial de fichajes</h3>
            <table style={styles.table}>
                <thead>
                    <tr style={{ background: "#f8fafc" }}>
                        <th style={styles.th}>Fecha/Hora</th>
                        <th style={styles.th}>Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    {fichajes.length === 0 ? (
                        <tr><td colSpan={2} style={styles.td}>No hay fichajes.</td></tr>
                    ) : (
                        fichajes.map((f, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                <td style={styles.td}>{formatDate(f.created_at ?? f.fecha)}</td>
                                <td style={styles.td}>{f.tipo}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: { display: "grid", gap: "1.5rem" },
    header: { alignItems: "center", display: "flex", justifyContent: "space-between", gap: "1rem" },
    kicker: { color: "#2563eb", fontSize: "0.82rem", fontWeight: 900, textTransform: "uppercase" },
    title: { color: "#0f172a", fontSize: "2rem", margin: "0.2rem 0" },
    muted: { color: "#64748b", margin: 0 },
    statCard: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, color: "#1d4ed8", display: "grid", gap: "0.2rem", minWidth: 130, padding: "1rem", textAlign: "center" },
    actions: { display: "flex", flexWrap: "wrap", gap: "0.8rem" },
    actionButton: { border: "none", borderRadius: 8, color: "white", cursor: "pointer", fontWeight: 900, padding: "0.9rem 1.4rem" },
    sectionTitle: { color: "#0f172a", margin: 0 },
    table: { width: "100%", textAlign: "left", borderCollapse: "collapse", overflow: "hidden", borderRadius: 10 },
    th: { color: "#334155", padding: 12 },
    td: { color: "#475569", padding: 12 },
};

export default Dashboard;
