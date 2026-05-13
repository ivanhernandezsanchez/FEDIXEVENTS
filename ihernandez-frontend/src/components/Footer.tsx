import { Link, useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();

  if (location.pathname.startsWith("/intranet")) {
    return null;
  }

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .footer-inner {
            grid-template-columns: 1fr !important;
            padding: 1.75rem 1.25rem !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.35rem !important;
            padding: 1rem 1.25rem 1.4rem !important;
          }
        }
      `}</style>

      <footer id="site-footer" style={styles.footer}>
        <div className="footer-inner" style={styles.inner}>
          <div style={styles.brandBlock}>
            <span style={styles.kicker}>Despedidas sin caos</span>
            <div style={{ background: "#fff", borderRadius: 10, padding: "4px 10px", display: "inline-flex", marginBottom: "0.55rem" }}>
              <img src="/logo.png" alt="FedixEvents" style={{ height: 48 }} />
            </div>
            <p style={styles.text}>
              Planes, actividades y propuestas personalizadas para montar una despedida redonda sin perder tardes enteras organizando.
            </p>
            <div style={styles.trustRow}>
              <span style={styles.trustPill}>Planes IA</span>
              <span style={styles.trustPill}>Carrito grupal</span>
              <span style={styles.trustPill}>Reseñas reales</span>
            </div>
          </div>

          <div>
            <span style={styles.heading}>Explorar</span>
            <nav style={styles.links} aria-label="Footer">
              <Link to="/" style={styles.link}>Inicio</Link>
              <Link to="/catalog" style={styles.link}>Catálogo</Link>
              <Link to="/contact" style={styles.link}>Contacto</Link>
              <Link to="/cart" style={styles.link}>Carrito</Link>
            </nav>
          </div>

          <div style={styles.contact}>
            <span style={styles.heading}>Atención</span>
            <span>info@despedidasfedi.com</span>
            <span>Madrid, España</span>
            <Link to="/catalog" style={styles.ctaLink}>Ver planes disponibles</Link>
          </div>
        </div>

        <div className="footer-bottom" style={styles.bottom}>
          <span>© 2026 FedixEvents</span>
          <span>Ideas con cabeza, reservas sin lío y un poco de chispa.</span>
        </div>
      </footer>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    background:
      "radial-gradient(circle at 8% 80%, rgba(168, 85, 247, 0.14), transparent 28rem), radial-gradient(circle at 90% 20%, rgba(219, 39, 119, 0.1), transparent 24rem), linear-gradient(135deg, #0D0920, #1E1B4B 52%, #2E1065)",
    borderTop: "1px solid rgba(168, 85, 247, 0.2)",
    color: "#ffffff",
    marginTop: "3rem",
  },
  inner: {
    display: "grid",
    gap: "2rem",
    gridTemplateColumns: "minmax(280px, 1.6fr) minmax(170px, 0.6fr) minmax(230px, 0.8fr)",
    margin: "0 auto",
    maxWidth: 1220,
    padding: "2.5rem 2.2rem",
  },
  brandBlock: {
    maxWidth: 620,
  },
  kicker: {
    color: "#A855F7",
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 900,
    letterSpacing: "0.04em",
    marginBottom: "0.45rem",
    textTransform: "uppercase",
  },
  brand: {
    display: "block",
    fontSize: "1.85rem",
    marginBottom: "0.55rem",
  },
  text: {
    color: "#c4b5fd",
    lineHeight: 1.55,
    margin: 0,
    maxWidth: 560,
  },
  trustRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.55rem",
    marginTop: "1rem",
  },
  trustPill: {
    background: "rgba(168, 85, 247, 0.12)",
    border: "1px solid rgba(168, 85, 247, 0.35)",
    borderRadius: "999px",
    color: "#e9d5ff",
    fontSize: "0.82rem",
    fontWeight: 800,
    padding: "0.4rem 0.65rem",
  },
  heading: {
    color: "#A855F7",
    display: "block",
    fontSize: "0.82rem",
    fontWeight: 900,
    marginBottom: "0.8rem",
    textTransform: "uppercase",
  },
  links: {
    display: "grid",
    gap: "0.65rem",
  },
  link: {
    color: "#c4b5fd",
    fontWeight: 700,
    textDecoration: "none",
  },
  contact: {
    color: "#c4b5fd",
    display: "grid",
    gap: "0.45rem",
  },
  ctaLink: {
    alignSelf: "start",
    background: "linear-gradient(135deg, #DB2777, #F97316)",
    borderRadius: "999px",
    color: "#ffffff",
    fontWeight: 900,
    marginTop: "0.65rem",
    padding: "0.7rem 1.1rem",
    textDecoration: "none",
  },
  bottom: {
    alignItems: "center",
    borderTop: "1px solid rgba(168, 85, 247, 0.2)",
    color: "#9ca3af",
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    justifyContent: "space-between",
    margin: "0 auto",
    maxWidth: 1220,
    padding: "1rem 2.2rem 1.2rem",
  },
};

export default Footer;
