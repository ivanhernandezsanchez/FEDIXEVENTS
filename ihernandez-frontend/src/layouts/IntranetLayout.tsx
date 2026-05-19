import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../UserContext";

function IntranetLayout() {
    const { user, logout } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <>
            <style>{`
                .intranet-close-btn { display: none !important; }
                .intranet-hamburger-row { display: none !important; }
                @media (max-width: 768px) {
                    .intranet-sidebar {
                        position: fixed !important;
                        left: -290px !important;
                        top: 0 !important;
                        height: 100vh !important;
                        z-index: 300 !important;
                        transition: left 0.25s ease !important;
                        overflow-y: auto !important;
                    }
                    .intranet-sidebar.open {
                        left: 0 !important;
                        box-shadow: 6px 0 32px rgba(0,0,0,0.5) !important;
                    }
                    .intranet-close-btn { display: block !important; }
                    .intranet-hamburger-row { display: flex !important; }
                    .intranet-main { padding: 16px !important; }
                    .intranet-card { padding: 16px !important; }
                }
            `}</style>

            <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Trebuchet MS, Arial, sans-serif" }}>
                {user?.role === "employee" && (
                    <aside
                        className="intranet-sidebar"
                        style={{ width: 280, background: "#111827", color: "white", padding: 22, position: "sticky", top: 0, height: "100vh", overflowY: "auto", flexShrink: 0 }}
                    >
                        <h2 style={{ color: "#93c5fd", margin: 0 }}>Panel empleado</h2>
                        <p style={{ color: "#cbd5e1", marginTop: 8 }}>Hola, {user.name}</p>
                        <hr style={{ borderColor: "#334155", margin: "18px 0" }} />
                        <nav style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
                            <Link to="/intranet/works-council/attendance" style={navLink}>Fichajes</Link>
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

                {user?.role === "admin" && (
                    <>
                        {/* Overlay — only rendered when sidebar is open on mobile */}
                        {sidebarOpen && (
                            <div
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    position: "fixed",
                                    inset: 0,
                                    background: "rgba(0,0,0,0.5)",
                                    zIndex: 250,
                                }}
                            />
                        )}

                        <aside
                            className={`intranet-sidebar${sidebarOpen ? " open" : ""}`}
                            style={{
                                width: 280,
                                background: "#111827",
                                color: "white",
                                padding: 22,
                                position: "sticky",
                                top: 0,
                                height: "100vh",
                                overflowY: "auto",
                                flexShrink: 0,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h2 style={{ color: "#93c5fd", margin: 0 }}>Panel interno</h2>
                                <button
                                    className="intranet-close-btn"
                                    onClick={() => setSidebarOpen(false)}
                                    style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "2px 6px" }}
                                >✕</button>
                            </div>
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
                    </>
                )}

                <main
                    className="intranet-main"
                    style={{ flex: 1, padding: 40, background: "#eef2f7", color: "#172033", minWidth: 0 }}
                >
                    {/* Hamburger row — shown only on mobile via CSS */}
                    {user?.role === "admin" && (
                        <div
                            className="intranet-hamburger-row"
                            style={{ alignItems: "center", gap: "12px", marginBottom: "16px" }}
                        >
                            <button
                                onClick={() => setSidebarOpen(true)}
                                style={{ background: "#111827", border: "none", color: "white", cursor: "pointer", fontSize: 18, padding: "8px 12px", borderRadius: 8 }}
                            >
                                ☰
                            </button>
                            <span style={{ fontWeight: 700, color: "#374151", fontSize: "1rem" }}>Panel interno</span>
                        </div>
                    )}

                    <div style={{ marginBottom: 20 }}>
                        <Link to="/" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "bold" }}>← Volver a la tienda</Link>
                    </div>

                    <div className="intranet-card" style={{ background: "white", padding: 30, borderRadius: 10, boxShadow: "0 14px 36px rgba(15,23,42,0.08)" }}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </>
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
