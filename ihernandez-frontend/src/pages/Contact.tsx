import { useState } from "react";

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .contact-page {
          grid-template-columns: 1fr !important;
          padding: 1rem !important;
          gap: 1.25rem !important;
        }
        .contact-hero {
          min-height: 320px !important;
        }
      }
    `}</style>
    <main className="contact-page" style={styles.page}>
      <section className="contact-hero" style={styles.hero}>
        <div style={styles.heroCopy}>
          <span style={styles.kicker}>Contact</span>
          <h1 style={styles.title}>Tell us about the event you have in mind</h1>
          <p style={styles.text}>
            Tell us the city, number of people, budget and vibe you're after. We'll help you shape it into a clear, easy-to-book plan.
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
              <strong>Phone</strong>
              <p>600 111 222</p>
            </div>
          </article>
          <article style={styles.infoCard}>
            <span style={styles.cardIcon}>★</span>
            <div>
              <strong>Response</strong>
              <p>Usually within 24 hours</p>
            </div>
          </article>
        </div>
      </section>

      <section style={styles.formSection}>
        <div style={styles.formHeader}>
          <span style={styles.formBadge}>Custom proposal</span>
          <h2 style={styles.formTitle}>Let's plan it right</h2>
          <p style={styles.formText}>The more context you give us, the better the plan.</p>
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
              <span style={styles.label}>Name</span>
              <input required placeholder="Your name" style={styles.input} />
            </label>
            <label style={styles.field}>
              <span style={styles.label}>Email</span>
              <input required type="email" placeholder="you@email.com" style={styles.input} />
            </label>
          </div>

          <div style={styles.fieldGrid}>
            <label style={styles.field}>
              <span style={styles.label}>City</span>
              <input placeholder="Madrid, Valencia, Seville..." style={styles.input} />
            </label>
            <label style={styles.field}>
              <span style={styles.label}>Plan type</span>
              <select style={styles.input} defaultValue="">
                <option value="" disabled>Choose an option</option>
                <option>Party &amp; nightlife</option>
                <option>Adventure</option>
                <option>Relax &amp; food</option>
                <option>Mixed plan</option>
                <option>Premium surprise</option>
              </select>
            </label>
          </div>

          <label style={styles.field}>
            <span style={styles.label}>Message</span>
            <textarea
              required
              placeholder="We're a group of 10, looking for a dinner, fun activity and some partying..."
              style={styles.textarea}
            />
          </label>

          <button style={styles.button}>Send proposal</button>
          {sent && <p style={styles.success}>Done! We've received your request and will put together a proposal for you.</p>}
        </form>
      </section>
    </main>
    </>
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
