import { useState } from "react";

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroCopy}>
          <span style={styles.kicker}>Contacto</span>
          <h1 style={styles.title}>Cuéntanos la despedida que tienes en mente</h1>
          <p style={styles.text}>
            Dinos ciudad, número de personas, presupuesto y el nivel de fiesta que buscáis. Te ayudamos a aterrizarlo en un plan claro y fácil de reservar.
          </p>
        </div>

        <div style={styles.contactCards}>
          <article style={styles.infoCard}>
            <span style={styles.cardIcon}>@</span>
            <div>
              <strong>Email</strong>
              <p>info@despedidasfedi.com</p>
            </div>
          </article>
          <article style={styles.infoCard}>
            <span style={styles.cardIcon}>☎</span>
            <div>
              <strong>Teléfono</strong>
              <p>600 111 222</p>
            </div>
          </article>
          <article style={styles.infoCard}>
            <span style={styles.cardIcon}>★</span>
            <div>
              <strong>Respuesta</strong>
              <p>Normalmente en menos de 24h</p>
            </div>
          </article>
        </div>
      </section>

      <section style={styles.formSection}>
        <div style={styles.formHeader}>
          <span style={styles.formBadge}>Propuesta personalizada</span>
          <h2 style={styles.formTitle}>Vamos a montarla bien</h2>
          <p style={styles.formText}>Cuanto más contexto nos des, más fina sale la idea.</p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
          style={styles.form}
        >
          <div style={styles.fieldGrid}>
            <label style={styles.field}>
              <span style={styles.label}>Nombre</span>
              <input required placeholder="Tu nombre" style={styles.input} />
            </label>
            <label style={styles.field}>
              <span style={styles.label}>Email</span>
              <input required type="email" placeholder="tu@email.com" style={styles.input} />
            </label>
          </div>

          <div style={styles.fieldGrid}>
            <label style={styles.field}>
              <span style={styles.label}>Ciudad</span>
              <input placeholder="Madrid, Valencia, Sevilla..." style={styles.input} />
            </label>
            <label style={styles.field}>
              <span style={styles.label}>Tipo de plan</span>
              <select style={styles.input} defaultValue="">
                <option value="" disabled>Elige una opción</option>
                <option>Fiesta y noche</option>
                <option>Aventura</option>
                <option>Relax y comida</option>
                <option>Plan mixto</option>
                <option>Premium sorpresa</option>
              </select>
            </label>
          </div>

          <label style={styles.field}>
            <span style={styles.label}>Mensaje</span>
            <textarea
              required
              placeholder="Somos 10, buscamos algo con cena, actividad divertida y algo de fiesta..."
              style={styles.textarea}
            />
          </label>

          <button style={styles.button}>Enviar propuesta</button>
          {sent && <p style={styles.success}>Listo. Hemos recibido tu idea y te prepararemos una propuesta.</p>}
        </form>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "grid",
    gap: "2rem",
    gridTemplateColumns: "minmax(320px, 0.9fr) minmax(420px, 1.1fr)",
    margin: "0 auto",
    maxWidth: 1180,
    padding: "2rem",
  },
  hero: {
    background:
      "linear-gradient(135deg, rgba(13,9,32,0.97), rgba(46,16,101,0.88), rgba(219,39,119,0.72)), url('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80')",
    backgroundPosition: "center",
    backgroundSize: "cover",
    border: "1px solid rgba(168, 85, 247, 0.2)",
    borderRadius: 12,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 620,
    overflow: "hidden",
    padding: "2rem",
  },
  heroCopy: {
    maxWidth: 560,
  },
  kicker: {
    background: "rgba(168, 85, 247, 0.18)",
    border: "1px solid rgba(168, 85, 247, 0.55)",
    borderRadius: 999,
    color: "#e9d5ff",
    display: "inline-block",
    fontSize: "0.85rem",
    fontWeight: 900,
    marginBottom: "1rem",
    padding: "0.45rem 0.7rem",
    textTransform: "uppercase",
  },
  title: {
    color: "#fff",
    fontFamily: "Arial Black, Trebuchet MS, Arial, sans-serif",
    fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
    lineHeight: 1.02,
    margin: 0,
  },
  text: {
    color: "#c4b5fd",
    fontSize: "1.05rem",
    lineHeight: 1.65,
    marginTop: "1rem",
  },
  contactCards: {
    display: "grid",
    gap: "0.85rem",
    marginTop: "2rem",
  },
  infoCard: {
    alignItems: "center",
    background: "rgba(168, 85, 247, 0.1)",
    border: "1px solid rgba(168, 85, 247, 0.3)",
    borderRadius: 8,
    display: "flex",
    gap: "0.9rem",
    padding: "1rem",
  },
  cardIcon: {
    alignItems: "center",
    background: "linear-gradient(135deg, #DB2777, #F97316)",
    borderRadius: 999,
    color: "#fff",
    display: "inline-flex",
    fontWeight: 900,
    height: 38,
    justifyContent: "center",
    minWidth: 38,
  },
  formSection: {
    background: "rgba(30, 27, 75, 0.55)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(168, 85, 247, 0.25)",
    borderRadius: 12,
    boxShadow: "0 20px 44px rgba(46, 16, 101, 0.3)",
    padding: "2rem",
  },
  formHeader: {
    marginBottom: "1.5rem",
  },
  formBadge: {
    color: "#A855F7",
    fontSize: "0.82rem",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  formTitle: {
    color: "#F3F4F6",
    fontSize: "2rem",
    margin: "0.35rem 0",
  },
  formText: {
    color: "#9ca3af",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  fieldGrid: {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  field: {
    display: "grid",
    gap: "0.45rem",
  },
  label: {
    color: "#A855F7",
    fontSize: "0.85rem",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  input: {
    background: "rgba(13, 9, 32, 0.6)",
    border: "1px solid rgba(168, 85, 247, 0.4)",
    borderRadius: 10,
    color: "#F3F4F6",
    fontSize: "1rem",
    minHeight: 48,
    padding: "0.85rem 1rem",
  },
  textarea: {
    background: "rgba(13, 9, 32, 0.6)",
    border: "1px solid rgba(168, 85, 247, 0.4)",
    borderRadius: 10,
    color: "#F3F4F6",
    fontSize: "1rem",
    minHeight: 170,
    padding: "1rem",
    resize: "vertical",
  },
  button: {
    background: "linear-gradient(135deg, #DB2777, #F97316)",
    border: "none",
    borderRadius: 999,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    marginTop: "0.25rem",
    padding: "1rem 1.35rem",
    boxShadow: "0 8px 20px rgba(249, 115, 22, 0.3)",
  },
  success: {
    background: "rgba(52, 211, 153, 0.1)",
    border: "1px solid rgba(52, 211, 153, 0.4)",
    borderRadius: 8,
    color: "#34d399",
    fontWeight: 800,
    margin: 0,
    padding: "0.9rem",
  },
};

export default Contact;
