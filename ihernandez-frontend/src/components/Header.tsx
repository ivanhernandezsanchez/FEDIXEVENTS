import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { readCart } from "../cart";
import { useUser } from "../UserContext";

function Header() {
  const [totalItems, setTotalItems] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();

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

  return (
    <header style={{
      background: "rgba(10, 7, 25, 0.88)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(168, 85, 247, 0.15)",
      color: "white",
      padding: "14px 28px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      boxShadow: "0 4px 24px rgba(13, 9, 32, 0.5)",
      position: "sticky",
      top: 0,
      zIndex: 40,
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <div style={{ background: "#fff", borderRadius: 8, padding: "3px 8px", display: "inline-flex", alignItems: "center" }}>
          <img src="/logo.png" alt="FedixEvents" style={{ height: 34 }} />
        </div>
      </Link>

      {/* Center nav pill */}
      <nav style={{
        display: "flex",
        gap: "4px",
        alignItems: "center",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 999,
        padding: "5px 8px",
      }}>
        {[
          { to: "/", label: "Inicio" },
          { to: "/catalog", label: "Catálogo" },
          { to: "/contact", label: "Contacto" },
        ].map(({ to, label }) => (
          <Link key={to} to={to} style={{
            color: "#d1d5db",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
            padding: "6px 14px",
            borderRadius: 999,
            transition: "background 0.15s",
          }}>{label}</Link>
        ))}
        {user?.role === "customer" && (
          <Link to="/history" style={{ color: "#d1d5db", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "6px 14px", borderRadius: 999 }}>Historial</Link>
        )}
        {user?.role === "admin" ? (
          <Link to="/intranet/dashboard" style={{ color: "#A855F7", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: "6px 14px", borderRadius: 999 }}>Intranet</Link>
        ) : !user ? (
          <Link to="/intranet/login" style={{ color: "#A855F7", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: "6px 14px", borderRadius: 999 }}>Intranet</Link>
        ) : null}
      </nav>

      {/* Right actions */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {user ? (
          <>
            <span style={{ color: "#9ca3af", fontSize: 13 }}>{user.name}</span>
            <button
              onClick={async () => { await logout(); navigate("/"); }}
              style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 13, padding: "6px 10px" }}
            >Salir</button>
          </>
        ) : (
          <Link to="/intranet/login" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Log in</Link>
        )}
        <Link to="/cart" style={{
          background: "linear-gradient(135deg, #DB2777, #F97316)",
          padding: "8px 18px",
          borderRadius: 999,
          color: "white",
          fontWeight: 700,
          textDecoration: "none",
          fontSize: 14,
          boxShadow: "0 4px 16px rgba(219, 39, 119, 0.45)",
          whiteSpace: "nowrap",
        }}>
          🛒 {totalItems > 0 ? totalItems : ""}
        </Link>
      </div>
    </header>
  );
}

export default Header;
