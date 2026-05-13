import React from "react";
import { Link } from "react-router-dom";

const news = [
    {
        date: "12 May 2026",
        tag: "Negociación",
        tagColor: "#2563eb",
        tagBg: "#dbeafe",
        title: "Inicio de la negociación del nuevo convenio colectivo",
        body: "El comité ha iniciado el proceso de negociación con la dirección para la renovación del convenio colectivo 2026-2028. Las principales demandas incluyen subida salarial del 4%, ampliación de la bolsa de formación y mejora de los protocolos de conciliación.",
        priority: "alta",
    },
    {
        date: "5 May 2026",
        tag: "Aviso",
        tagColor: "#92400e",
        tagBg: "#fef3c7",
        title: "Cambio en el procedimiento de solicitud de vacaciones",
        body: "A partir del 1 de junio, las solicitudes de vacaciones deben tramitarse con un mínimo de 30 días de antelación a través del sistema interno. El comité ha negociado que las peticiones no puedan denegarse sin justificación escrita.",
        priority: "media",
    },
    {
        date: "28 Abr 2026",
        tag: "Logro",
        tagColor: "#166534",
        tagBg: "#dcfce7",
        title: "Aprobado el protocolo de teletrabajo",
        body: "Tras tres meses de negociación, la empresa ha aprobado el protocolo de teletrabajo que permite hasta 2 días semanales para los puestos elegibles. El comité supervisará su correcta aplicación.",
        priority: "alta",
    },
    {
        date: "15 Abr 2026",
        tag: "Información",
        tagColor: "#6d28d9",
        tagBg: "#ede9fe",
        title: "Recordatorio: derecho a desconexión digital",
        body: "El comité recuerda que todos los trabajadores tienen derecho a no responder comunicaciones laborales fuera de su jornada. Cualquier presión al respecto debe comunicarse al comité de forma confidencial.",
        priority: "baja",
    },
    {
        date: "1 Abr 2026",
        tag: "Formación",
        tagColor: "#0f766e",
        tagBg: "#ccfbf1",
        title: "Disponibles nuevos cursos en la bolsa de formación",
        body: "Se han incorporado 8 nuevos cursos homologados al catálogo de formación: Excel avanzado, atención al cliente digital, inglés de negocios y prevención de riesgos entre otros. Plazo de inscripción hasta el 15 de mayo.",
        priority: "media",
    },
    {
        date: "20 Mar 2026",
        tag: "Convocatoria",
        tagColor: "#dc2626",
        tagBg: "#fee2e2",
        title: "Reunión general de plantilla — 3 de junio",
        body: "El comité convoca reunión general de plantilla el próximo 3 de junio a las 18:00h en la sala de formación. Orden del día: presentación del estado de la negociación del convenio y turno de preguntas.",
        priority: "alta",
    },
];

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: "1200px", margin: "0 auto", padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.6, color: "#172033" },
    hero: { marginBottom: "2rem", padding: "2rem", background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)", color: "white", borderRadius: "8px", boxShadow: "0 18px 45px rgba(37, 99, 235, 0.22)" },
    title: { fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, margin: "0 0 0.75rem 0" },
    heroText: { fontSize: "1.125rem", margin: 0, opacity: 0.95 },
    backLink: { display: "inline-block", marginBottom: "2rem", padding: "0.5rem 1rem", background: "#f3f4f6", color: "#374151", textDecoration: "none", borderRadius: "6px", fontWeight: 500 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" },
    card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.5rem", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", position: "relative" as const, overflow: "hidden" },
    bar: { position: "absolute" as const, top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #0f766e, #2563eb)" },
    date: { fontSize: "0.82rem", color: "#94a3b8", fontWeight: 700, marginBottom: "0.5rem", display: "block" },
    cardTitle: { fontWeight: 800, fontSize: "1.05rem", margin: "0 0 0.6rem", color: "#172033" },
    cardBody: { color: "#64748b", fontSize: "0.93rem", margin: 0 },
};

function WorksCouncilNews() {
    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>← Volver al Comité de Empresa</Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Noticias y Avisos</h2>
                <p style={styles.heroText}>Tablón de novedades del comité de empresa: negociaciones, logros, convocatorias y comunicados importantes.</p>
            </section>

            <div style={styles.grid}>
                {news.map((n) => (
                    <article key={n.title} style={styles.card}>
                        <div style={styles.bar} />
                        <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 800, background: n.tagBg, color: n.tagColor, marginBottom: "0.5rem" }}>
                            {n.tag}
                        </span>
                        <span style={styles.date}>{n.date}</span>
                        <h4 style={styles.cardTitle}>{n.title}</h4>
                        <p style={styles.cardBody}>{n.body}</p>
                    </article>
                ))}
            </div>
        </div>
    );
}

export default WorksCouncilNews;
