import React, { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
    {
        q: "¿Cuántos días de vacaciones me corresponden al año?",
        a: "Según el Estatuto de los Trabajadores, tienes derecho a un mínimo de 30 días naturales (o 22 días hábiles) de vacaciones retribuidas al año. El convenio colectivo del sector puede mejorar esta cifra.",
        cat: "Vacaciones",
    },
    {
        q: "¿Qué hago si mi nómina tiene un error?",
        a: "Comunícalo primero al departamento de RRHH por escrito (correo electrónico o formulario interno). Si no se resuelve en 10 días, puedes trasladarlo al comité de empresa a través del buzón de sugerencias.",
        cat: "Nómina",
    },
    {
        q: "¿Puedo pedir un cambio de turno puntual?",
        a: "Sí. Debes solicitarlo a tu responsable directo con al menos 5 días de antelación. El cambio debe ser aceptado por ambas partes y quedar registrado. El comité vela porque no se impongan cambios unilaterales.",
        cat: "Horarios",
    },
    {
        q: "¿Qué permisos retribuidos tengo derecho a disfrutar?",
        a: "El Estatuto reconoce permisos por matrimonio (15 días), nacimiento de hijo (16 semanas), fallecimiento de familiar (2-4 días), mudanza (1 día), exámenes oficiales y cargo público. Consulta la sección 'Guía de Permisos' para más detalle.",
        cat: "Permisos",
    },
    {
        q: "¿Qué es una modificación sustancial de condiciones de trabajo?",
        a: "Es cualquier cambio relevante en jornada, horario, turnos, sistema de remuneración o funciones. La empresa debe notificarlo con 15 días de antelación. Tienes derecho a rescindir el contrato con una indemnización de 20 días/año si el cambio te perjudica.",
        cat: "Contratos",
    },
    {
        q: "¿Cómo puedo acceder a la bolsa de formación?",
        a: "La empresa tiene habilitada una bolsa anual de 20 horas de formación remunerada. Para solicitarla, comunícalo a tu responsable o a RRHH indicando el curso y el proveedor. El comité revisará que se respete la distribución equitativa.",
        cat: "Formación",
    },
    {
        q: "¿Qué hago si sufro acoso laboral?",
        a: "Puedes comunicarlo de forma confidencial al comité a través del buzón de sugerencias. El comité activará el protocolo interno. Si el problema persiste, puedes acudir a la Inspección de Trabajo o a la vía judicial. No estás solo/a.",
        cat: "Derechos",
    },
    {
        q: "¿Puedo ser despedido estando de baja médica?",
        a: "La baja médica no es causa de despido. Un despido durante una baja puede ser declarado nulo si existe conexión entre ambos. Si esto ocurre, contacta urgentemente con el comité o un asesor sindical.",
        cat: "Contratos",
    },
];

const categories = ["Todas", ...Array.from(new Set(faqs.map(f => f.cat)))];

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: "1200px", margin: "0 auto", padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.6, color: "#172033" },
    hero: { marginBottom: "2rem", padding: "2rem", background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)", color: "white", borderRadius: "8px", boxShadow: "0 18px 45px rgba(37, 99, 235, 0.22)" },
    title: { fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, margin: "0 0 0.75rem 0" },
    heroText: { fontSize: "1.125rem", margin: 0, opacity: 0.95 },
    backLink: { display: "inline-block", marginBottom: "2rem", padding: "0.5rem 1rem", background: "#f3f4f6", color: "#374151", textDecoration: "none", borderRadius: "6px", fontWeight: 500 },
    chips: { display: "flex", flexWrap: "wrap" as const, gap: "0.5rem", marginBottom: "1.5rem" },
    chip: { padding: "0.4rem 0.9rem", borderRadius: "999px", border: "2px solid #e2e8f0", background: "#fff", color: "#374151", cursor: "pointer", fontWeight: 600, fontSize: "0.88rem" },
    activeChip: { padding: "0.4rem 0.9rem", borderRadius: "999px", border: "2px solid #2563eb", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "0.88rem" },
    faqItem: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", marginBottom: "0.75rem", overflow: "hidden" },
    question: { padding: "1rem 1.25rem", fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "space-between" as const, alignItems: "center", fontSize: "1rem", color: "#172033" },
    answer: { padding: "0 1.25rem 1rem", color: "#64748b", fontSize: "0.95rem", borderTop: "1px solid #f1f5f9" },
    catTag: { fontSize: "0.75rem", fontWeight: 800, padding: "0.15rem 0.5rem", borderRadius: "999px", background: "#dbeafe", color: "#1e40af", marginLeft: "0.75rem" },
};

function WorksCouncilFAQ() {
    const [open, setOpen] = useState<number | null>(null);
    const [filter, setFilter] = useState("Todas");

    const visible = filter === "Todas" ? faqs : faqs.filter(f => f.cat === filter);

    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>← Volver al Comité de Empresa</Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Preguntas Frecuentes</h2>
                <p style={styles.heroText}>Respuestas a las dudas más comunes sobre derechos laborales, permisos, nóminas y contratos.</p>
            </section>

            <div style={styles.chips}>
                {categories.map(c => (
                    <button key={c} style={filter === c ? styles.activeChip : styles.chip} onClick={() => setFilter(c)}>{c}</button>
                ))}
            </div>

            <div>
                {visible.map((faq, i) => (
                    <div key={i} style={styles.faqItem}>
                        <div style={styles.question} onClick={() => setOpen(open === i ? null : i)}>
                            <span>
                                {faq.q}
                                <span style={styles.catTag}>{faq.cat}</span>
                            </span>
                            <span style={{ fontSize: "1.2rem", color: "#94a3b8", flexShrink: 0, marginLeft: "1rem" }}>{open === i ? "▲" : "▼"}</span>
                        </div>
                        {open === i && (
                            <div style={styles.answer}>
                                <p style={{ margin: "0.75rem 0 0" }}>{faq.a}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WorksCouncilFAQ;
