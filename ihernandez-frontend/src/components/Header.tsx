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
      background: "linear-gradient(90deg, #1d1028, #4c1d95 46%, #be123c)",
      color: "white",
      padding: "18px 34px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      boxShadow: "0 12px 32px rgba(29, 16, 40, 0.28)",
      position: "relative",
      zIndex: 40,
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 28, fontFamily: "Arial Black, Trebuchet MS, Arial, sans-serif" }}>Despedidas Fedi</h1>
        <p style={{ margin: 0, fontSize: 13, color: "#fde68a", fontWeight: 700 }}>Planes de despedida, reservas y propuestas IA</p>
      </div>

      <nav style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: 800 }}>Home</Link>
        <Link to="/catalog" style={{ color: "white", textDecoration: "none", fontWeight: 800 }}>Catálogo</Link>
        <Link to="/contact" style={{ color: "white", textDecoration: "none", fontWeight: 800 }}>Contacto</Link>
        {user?.role === "customer" && (
          <Link to="/history" style={{ color: "white", textDecoration: "none" }}>Historial</Link>
        )}
        {user?.role === "admin" ? (
          <Link to="/intranet/dashboard" style={{ color: "#5eead4", textDecoration: "none", fontWeight: "bold" }}>
            Intranet
          </Link>
        ) : !user ? (
          <Link to="/intranet/login" style={{ color: "#5eead4", textDecoration: "none", fontWeight: "bold" }}>
            Acceso Intranet
          </Link>
        ) : null}

        {user ? (
          <>
            <span style={{ color: "#d1d5db" }}>Hola, {user.name}</span>
            <button
              onClick={async () => {
                await logout();
                navigate("/");
              }}
              style={{
                background: "transparent",
                border: "1px solid #ffffff66",
                borderRadius: 6,
                padding: "6px 12px",
                color: "white",
                cursor: "pointer"
              }}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/intranet/login" style={{ color: "white", textDecoration: "none" }}>Entrar</Link>
        )}

        <Link to="/cart" style={{
          background: "linear-gradient(135deg, #ffbf00, #ff3e6c)",
          padding: "9px 14px",
          borderRadius: 999,
          color: "white",
          fontWeight: "bold",
          textDecoration: "none",
          boxShadow: "0 8px 18px rgba(255, 62, 108, 0.3)",
        }}>
          🛒 {totalItems}
        </Link>
      </nav>
    </header>
  );
}

export default Header;
