import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { readCart } from "../cart";
import { useUser } from "../UserContext";
import { useTheme } from "../ThemeContext";

function Header() {
  const [totalItems, setTotalItems] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isIntranet = location.pathname.startsWith("/intranet");
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = sessionStorage.getItem("cart");
      if (savedCart) {
        try {
          const cart = readCart();
          const total = cart.reduce((acc, item) => acc + item.quantity, 0);
          setTotalItems(total);
        } catch {
          setTotalItems(0);
        }
      } else {
        setTotalItems(0);
      }
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, [location.pathname]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/catalog", label: "Catalog" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <style>{`
        .hdr-nav { display: flex; }
        .hdr-hamburger { display: none !important; }
        .hdr-uname { display: inline; }
        @media (max-width: 640px) {
          .hdr-nav { display: none !important; }
          .hdr-hamburger { display: flex !important; }
          .hdr-uname { display: none !important; }
        }
      `}</style>

      <header style={{
        background: isDark ? "rgba(10, 7, 25, 0.88)" : "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: isDark ? "1px solid rgba(168, 85, 247, 0.15)" : "1px solid rgba(168, 85, 247, 0.25)",
        color: isDark ? "white" : "#1f0f3d",
        padding: "14px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        boxShadow: isDark ? "0 4px 24px rgba(13, 9, 32, 0.5)" : "0 4px 24px rgba(168, 85, 247, 0.1)",
        position: "sticky",
        top: 0,
        zIndex: 40,
        flexWrap: "wrap",
        gap: "8px",
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: "3px 8px", display: "inline-flex", alignItems: "center" }}>
            <img src="/logo.png" alt="FedixEvents" style={{ height: 34 }} />
          </div>
        </Link>

        {/* Center nav — hidden on mobile via CSS */}
        <nav className="hdr-nav" style={{
          gap: "4px",
          alignItems: "center",
          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(168,85,247,0.06)",
          backdropFilter: "blur(8px)",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(168,85,247,0.15)",
          borderRadius: 999,
          padding: "5px 8px",
        }}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              color: isDark ? "#d1d5db" : "#4b1d96",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
              padding: "6px 14px",
              borderRadius: 999,
              transition: "background 0.15s",
            }}>{label}</Link>
          ))}
          {user?.role === "customer" && (
            <Link to="/history" style={{ color: isDark ? "#d1d5db" : "#4b1d96", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "6px 14px", borderRadius: 999 }}>Orders</Link>
          )}
          {user?.role === "admin" ? (
            <Link to="/intranet/dashboard" style={{ color: "#A855F7", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: "6px 14px", borderRadius: 999 }}>Intranet</Link>
          ) : !user ? (
            <>
              <Link to="/intranet/login" style={{ color: isDark ? "#d1d5db" : "#4b1d96", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "6px 14px", borderRadius: 999 }}>Log in</Link>
              <Link to="/intranet/register" style={{ background: "linear-gradient(135deg,#DB2777,#F97316)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: "6px 14px", borderRadius: 999 }}>Sign up</Link>
            </>
          ) : null}
        </nav>

        {/* Right actions */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {user && (
            <span className="hdr-uname" style={{ color: isDark ? "#9ca3af" : "#6b21a8", fontSize: 13 }}>{user.name}</span>
          )}
          {user && (
            <button
              onClick={async () => { await logout(); navigate("/"); }}
              style={{ background: "transparent", border: "none", color: isDark ? "#9ca3af" : "#6b21a8", cursor: "pointer", fontSize: 13, padding: "6px 10px" }}
            >Log out</button>
          )}
          {!isIntranet && (
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(168,85,247,0.1)",
                border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(168,85,247,0.3)",
                borderRadius: 999,
                color: isDark ? "#e2d9f3" : "#6b21a8",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
                padding: "6px 10px",
                transition: "all 0.2s",
              }}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          )}
          <Link to="/cart" style={{
            background: "linear-gradient(135deg, #DB2777, #F97316)",
            padding: "8px 16px",
            borderRadius: 999,
            color: "white",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: 14,
            boxShadow: "0 4px 16px rgba(219, 39, 119, 0.45)",
            whiteSpace: "nowrap",
          }}>
            {totalItems > 0 ? totalItems : "Cart"}
          </Link>

          {/* Hamburger — visible only on mobile via CSS */}
          <button
            className="hdr-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              cursor: "pointer",
              fontSize: 18,
              padding: "6px 10px",
              borderRadius: 8,
              lineHeight: 1,
            }}
            aria-label="Menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            borderTop: "1px solid rgba(168, 85, 247, 0.2)",
            paddingTop: "8px",
          }}>
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
                color: "#d1d5db",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
                padding: "11px 4px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>{label}</Link>
            ))}
            {user?.role === "customer" && (
              <Link to="/history" onClick={() => setMenuOpen(false)} style={{ color: "#d1d5db", textDecoration: "none", fontWeight: 600, fontSize: 15, padding: "11px 4px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Order history</Link>
            )}
            {user?.role === "admin" ? (
              <Link to="/intranet/dashboard" onClick={() => setMenuOpen(false)} style={{ color: "#A855F7", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "11px 4px", borderBottom: "1px solid rgba(168,85,247,0.15)" }}>Intranet</Link>
            ) : !user ? (
              <>
                <Link to="/intranet/login" onClick={() => setMenuOpen(false)} style={{ color: "#d1d5db", textDecoration: "none", fontWeight: 600, fontSize: 15, padding: "11px 4px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Log in</Link>
                <Link to="/intranet/register" onClick={() => setMenuOpen(false)} style={{ color: "#DB2777", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "11px 4px", borderBottom: "1px solid rgba(219,39,119,0.15)" }}>Sign up</Link>
              </>
            ) : null}
            {user && (
              <div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 4px", marginTop: "4px" }}>
                <span style={{ color: "#9ca3af", fontSize: 13 }}>{user.name}</span>
                <button
                  onClick={async () => { setMenuOpen(false); await logout(); navigate("/"); }}
                  style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 13, padding: 0 }}
                >Log out</button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}

export default Header;
