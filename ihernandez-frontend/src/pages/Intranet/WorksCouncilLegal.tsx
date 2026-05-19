import React, { useState } from "react";
import { Link } from "react-router-dom";

const normas = [
    {
        title: "Estatuto de los Trabajadores",
        href: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430",
        color: "#2563eb",
        bg: "#eff6ff",
        border: "#bfdbfe",
        icon: "⚖️",
        resumen: "La norma base que regula todos los contratos laborales en España.",
        pildoras: [
            { label: "Vacaciones", texto: "Mínimo 30 días naturales retribuidos al año. No sustituibles por compensación económica salvo extinción del contrato (Art. 38)." },
            { label: "Jornada máxima", texto: "40 horas semanales de trabajo efectivo de promedio anual. Máximo 9 horas diarias ordinarias. Descanso mínimo de 15 minutos si la jornada continua supera 6 horas (Art. 34)." },
            { label: "Descanso mínimo", texto: "Mínimo 12 horas entre el final de una jornada y el comienzo de la siguiente. Descanso semanal de día y medio ininterrumpido: tarde del sábado o mañana del lunes + domingo completo (Art. 34 y 37)." },
            { label: "Horas extraordinarias", texto: "Máximo 80 horas al año. Se abonan como mínimo al precio de la hora ordinaria o se compensan con descanso. Sin pacto, deben compensarse con descanso en los 4 meses siguientes (Art. 35)." },
            { label: "Preaviso de despido", texto: "El despido objetivo requiere un preaviso mínimo de 15 días desde la comunicación hasta la extinción. El disciplinario se notifica mediante carta entregada en mano (Art. 53)." },
            { label: "Modificación sustancial", texto: "15 días de antelación mínima si la empresa modifica jornada, horario, turnos, salario o funciones. Si el trabajador resulta perjudicado puede rescindir con indemnización de 20 días/año (máx. 9 meses) (Art. 41)." },
            { label: "Salario mínimo", texto: "El SMI se actualiza anualmente por Decreto. En 2026: 1.221 € brutos al mes en 14 pagas (Art. 27)." },
        ],
        enlaceInterno: "/intranet/works-council/contract-info",
        enlaceInternoLabel: "Guía de contratos →",
    },
    {
        title: "Convenio Colectivo — Agencias de Viajes",
        href: "https://www.boe.es/boe/dias/2026/02/21/pdfs/BOE-A-2026-4051.pdf",
        color: "#0f766e",
        bg: "#f0fdfa",
        border: "#99f6e4",
        icon: "✈️",
        resumen: "Marco sectorial aplicable a empresas de organización de experiencias y viajes grupales. Última modificación: BOE 21/02/2026.",
        pildoras: [
            { label: "Grupos profesionales", texto: "3 grupos: G1 Técnicos/as Gestores/as, G2 Agentes de viajes y administración (mandos y ejecución, niveles 1–10), G3 Servicios generales." },
            { label: "Período de prueba", texto: "Titulados técnicos superiores: 6 meses. Trabajadores generales: 2 meses (3 meses en empresas de menos de 25 empleados). Personal no cualificado o nivel 1: 1 mes." },
            { label: "Formación obligatoria", texto: "Nivel 1: 50 h/año (150 h totales). Niveles 2-3: 40 h/año. Niveles 4-7: 30 h/año. Niveles 8-10: 15 h/año. Permisos individuales de formación: hasta 200 h laborales por persona." },
            { label: "Teletrabajo", texto: "Mínimo 2 días semanales de teletrabajo, ampliables por acuerdo. Reversibilidad con 30 días de preaviso. Mismas condiciones que el trabajo presencial." },
            { label: "Baja por enfermedad (IT)", texto: "Resolución BOE 21/02/2026: se declara nulo el límite de 4 días anuales de IT con complemento salarial y el umbral del 5% de absentismo que excluía dicho complemento." },
            { label: "Finiquito", texto: "La empresa debe entregar el finiquito con 5 días naturales de antelación. En contratos de 1 año o más, el plazo es de 15 días naturales." },
        ],
        enlaceInterno: "/intranet/works-council/agreements",
        enlaceInternoLabel: "Acuerdos conseguidos →",
    },
    {
        title: "Ley de Prevención de Riesgos Laborales",
        href: "https://www.boe.es/buscar/act.php?id=BOE-A-1995-24292",
        color: "#d97706",
        bg: "#fffbeb",
        border: "#fde68a",
        icon: "🦺",
        resumen: "Establece las obligaciones de la empresa para garantizar la seguridad y salud de los trabajadores.",
        pildoras: [
            { label: "Evaluación de riesgos", texto: "La empresa debe evaluar todos los puestos de trabajo e identificar los riesgos antes de que ocurran." },
            { label: "Formación obligatoria", texto: "Todo trabajador debe recibir formación específica en prevención de riesgos de su puesto al incorporarse." },
            { label: "EPI gratuitos", texto: "Los equipos de protección individual (guantes, calzado, etc.) los facilita la empresa sin coste para el trabajador." },
            { label: "Vigilancia de la salud", texto: "Reconocimientos médicos periódicos en horario laboral y a cargo de la empresa. Voluntarios salvo excepciones." },
            { label: "Derecho a paralizar", texto: "Ante riesgo grave e inminente, el trabajador puede abandonar el puesto sin sanción." },
            { label: "Delegado de prevención", texto: "Representante elegido entre los trabajadores para supervisar las medidas preventivas de la empresa." },
        ],
        enlaceInterno: "/intranet/works-council/faq",
        enlaceInternoLabel: "Preguntas frecuentes →",
    },
    {
        title: "Ley Orgánica de Libertad Sindical",
        href: "https://www.boe.es/buscar/pdf/1985/BOE-A-1985-16660-consolidado.pdf",
        color: "#7c3aed",
        bg: "#f5f3ff",
        border: "#ddd6fe",
        icon: "🤝",
        resumen: "Garantiza el derecho a sindicarse, crear sindicatos y ejercer la acción sindical en la empresa. Ley Orgánica 11/1985, de 2 de agosto.",
        pildoras: [
            { label: "Derecho a afiliarse", texto: "Todo trabajador puede sindicarse libremente. Nadie puede ser obligado a afiliarse ni desafiliarse. Incluye fundar sindicatos sin autorización previa y elegir representantes internos (Arts. 1 y 2)." },
            { label: "Acción sindical", texto: "La libertad sindical comprende: negociación colectiva, ejercicio del derecho de huelga, planteamiento de conflictos individuales y colectivos, y presentación de candidaturas a comités de empresa (Art. 2)." },
            { label: "Secciones sindicales", texto: "Cualquier sindicato puede constituir secciones sindicales. Los sindicatos más representativos y con representación en comité tienen derecho a tablón de anuncios y, en empresas de más de 250 trabajadores, a un local sindical (Art. 8)." },
            { label: "Delegados sindicales", texto: "En empresas de más de 250 trabajadores, los sindicatos con al menos el 10% de los votos del comité tienen derecho a delegado sindical. Escala: 250–750 trabajadores: 1; 751–2.000: 2; 2.001–5.000: 3; 5.001 en adelante: 4 (Art. 10)." },
            { label: "Garantías del delegado", texto: "Los delegados sindicales tienen las mismas garantías que los miembros del comité de empresa: acceso a información empresarial, asistencia a reuniones del comité (con voz pero sin voto) y derecho a ser oídos antes de medidas colectivas y despidos de afiliados (Art. 10.3)." },
            { label: "Protección antisindical", texto: "Son nulos los preceptos, cláusulas de convenios, pactos individuales y decisiones empresariales que discriminen por razón de afiliación o no afiliación sindical. El trabajador puede reclamar tutela jurisdiccional de derechos fundamentales (Arts. 12 y 13)." },
        ],
        enlaceInterno: "/intranet/works-council/elections",
        enlaceInternoLabel: "Elecciones sindicales →",
    },
];

const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: "1200px", margin: "0 auto", padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.6, color: "#172033" },
    hero: { marginBottom: "2rem", padding: "2rem", background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)", color: "white", borderRadius: "8px", boxShadow: "0 18px 45px rgba(37, 99, 235, 0.22)" },
    title: { fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, margin: "0 0 0.75rem 0" },
    heroText: { fontSize: "1.125rem", margin: 0, opacity: 0.95, maxWidth: "760px" },
    backLink: { display: "inline-block", marginBottom: "2rem", padding: "0.5rem 1rem", background: "#f3f4f6", color: "#374151", textDecoration: "none", borderRadius: "6px", fontWeight: 500 },
    normaCard: { borderRadius: "12px", border: "1px solid", marginBottom: "1.75rem", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
    normaHeader: { padding: "1.25rem 1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between" as const, gap: "1rem", cursor: "pointer" },
    normaIcon: { fontSize: "1.6rem", flexShrink: 0 },
    normaTitle: { fontWeight: 900, fontSize: "1.1rem", margin: "0 0 0.25rem" },
    normaResumen: { fontSize: "0.9rem", margin: 0, opacity: 0.8 },
    btnRow: { display: "flex", gap: "0.75rem", alignItems: "center", flexShrink: 0 },
    pildorasGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.85rem", padding: "0 1.5rem 1.5rem" },
    pildora: { borderRadius: "10px", padding: "1rem 1.1rem", background: "#fff", border: "1px solid #e2e8f0" },
    pildoraLabel: { fontWeight: 900, fontSize: "0.8rem", textTransform: "uppercase" as const, letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" },
    pildoraTexto: { fontSize: "0.88rem", color: "#374151", margin: 0, lineHeight: 1.5 },
    footer: { borderTop: "1px solid #f1f5f9", padding: "0.85rem 1.5rem", display: "flex", gap: "1rem", alignItems: "center" },
    boeBtn: { fontSize: "0.83rem", fontWeight: 700, textDecoration: "none", padding: "0.4rem 0.85rem", borderRadius: "6px", border: "1px solid" },
    internoBtn: { fontSize: "0.83rem", fontWeight: 700, textDecoration: "none", padding: "0.4rem 0.85rem", borderRadius: "6px", background: "#f8fafc", color: "#374151", border: "1px solid #e2e8f0" },
};

function WorksCouncilLegal() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <div style={styles.page}>
            <Link to="/intranet/works-council" style={styles.backLink}>← Volver al Comité de Empresa</Link>

            <section style={styles.hero}>
                <h2 style={styles.title}>Normativa Laboral</h2>
                <p style={styles.heroText}>
                    Las 4 normas esenciales que regulan tu trabajo, con las píldoras más importantes de cada una y acceso directo al BOE.
                </p>
            </section>

            {normas.map((n, i) => (
                <div key={n.title} style={{ ...styles.normaCard, borderColor: n.border, background: n.bg }}>
                    <div style={styles.normaHeader} onClick={() => setOpen(open === i ? null : i)}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flex: 1 }}>
                            <span style={styles.normaIcon}>{n.icon}</span>
                            <div>
                                <h3 style={{ ...styles.normaTitle, color: n.color }}>{n.title}</h3>
                                <p style={{ ...styles.normaResumen, color: n.color }}>{n.resumen}</p>
                            </div>
                        </div>
                        <span style={{ color: n.color, fontSize: "1.1rem", flexShrink: 0 }}>{open === i ? "▲" : "▼"}</span>
                    </div>

                    {open === i && (
                        <>
                            <div style={styles.pildorasGrid}>
                                {n.pildoras.map((p) => (
                                    <div key={p.label} style={styles.pildora}>
                                        <span style={{ ...styles.pildoraLabel, color: n.color }}>{p.label}</span>
                                        <p style={styles.pildoraTexto}>{p.texto}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={styles.footer}>
                                <a href={n.href} target="_blank" rel="noreferrer"
                                    style={{ ...styles.boeBtn, color: n.color, borderColor: n.border }}>
                                    Ver texto completo en BOE ↗
                                </a>
                                <Link to={n.enlaceInterno} style={styles.internoBtn}>
                                    {n.enlaceInternoLabel}
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export default WorksCouncilLegal;
