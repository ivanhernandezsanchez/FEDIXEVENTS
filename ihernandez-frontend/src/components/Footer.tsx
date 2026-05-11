import { Link, useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();

  if (location.pathname.startsWith("/intranet")) {
    return null;
  }

  return (
    <footer id="site-footer" style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.brandBlock}>
          <span style={styles.kicker}>Despedidas sin caos</span>
          <strong style={styles.brand}>Despedidas Fedi</strong>
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
      <div style={styles.bottom}>
        <span>© 2026 Despedidas Fedi</span>
        <span>Ideas con cabeza, reservas sin lío y un poco de chispa.</span>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    background:
      "radial-gradient(circle at 10% 20%, rgba(255, 191, 0, 0.2), transparent 26rem), linear-gradient(135deg, #1d1028, #4c1d95 52%, #be123c)",
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
    color: "#fde68a",
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 900,
    letterSpacing: "0.04em",
    marginBottom: "0.45rem",
    textTransform: "uppercase",
  },
  brand: {
    display: "block",
    fontSize: "1.65rem",
    marginBottom: "0.55rem",
  },
  text: {
    color: "#dbeafe",
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
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "999px",
    color: "#ffffff",
    fontSize: "0.82rem",
    fontWeight: 800,
    padding: "0.4rem 0.65rem",
  },
  heading: {
    color: "#fde68a",
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
    color: "#e0f2fe",
    fontWeight: 700,
    textDecoration: "none",
  },
  contact: {
    color: "#dbeafe",
    display: "grid",
    gap: "0.45rem",
  },
  ctaLink: {
    alignSelf: "start",
    background: "#ff6f61",
    borderRadius: "6px",
    color: "#ffffff",
    fontWeight: 900,
    marginTop: "0.65rem",
    padding: "0.7rem 0.9rem",
    textDecoration: "none",
  },
  bottom: {
    alignItems: "center",
    borderTop: "1px solid rgba(255, 255, 255, 0.14)",
    color: "#bfdbfe",
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
