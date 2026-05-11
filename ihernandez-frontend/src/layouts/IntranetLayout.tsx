import { Link, Outlet } from "react-router-dom";
import { useUser } from "../UserContext";

function IntranetLayout() {
    const { user, logout } = useUser();

    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Trebuchet MS, Arial, sans-serif" }}>
            {user?.role === "admin" && (
                <aside style={{ width: 280, background: "#111827", color: "white", padding: 22, position: "sticky", top: 0, height: "100vh" }}>
                    <h2 style={{ color: "#93c5fd", margin: 0 }}>Panel interno</h2>
                    <p style={{ color: "#cbd5e1", marginTop: 8 }}>Hola, {user.name}</p>
                    <hr style={{ borderColor: "#334155", margin: "18px 0" }} />

                    <nav style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
                        <Link to="/intranet/dashboard" style={navLink}>Dashboard / Fichajes</Link>
                        <Link to="/intranet/products" style={navLink}>Gestión productos</Link>
                        <Link to="/intranet/orders" style={navLink}>Gestión pedidos</Link>
                        <Link to="/intranet/users" style={navLink}>Gestión usuarios</Link>
                        <Link to="/intranet/works-council" style={navLink}>Comité de empresa</Link>
                        <button
                            onClick={logout}
                            style={{ marginTop: 20, background: "#dc2626", color: "white", border: "none", padding: "0.8rem 1rem", cursor: "pointer", borderRadius: 8, fontWeight: 800 }}
                        >
                            Cerrar Sesión
                        </button>
                    </nav>
                </aside>
            )}

            <main style={{ flex: 1, padding: 40, background: "#eef2f7" }}>
                <div style={{ marginBottom: 20 }}>
                    <Link to="/" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "bold" }}>← Volver a la tienda</Link>
                </div>

                <div style={{ background: "white", padding: 30, borderRadius: 10, boxShadow: "0 14px 36px rgba(15,23,42,0.08)" }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

const navLink: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    color: "white",
    fontWeight: 800,
    padding: "0.8rem 0.9rem",
    textDecoration: "none",
};

export default IntranetLayout;
