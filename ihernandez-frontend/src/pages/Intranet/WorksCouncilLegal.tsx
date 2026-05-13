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
            { label: "Vacaciones", texto: "Mínimo 30 días naturales (22 hábiles) retribuidos al año. No se pueden compensar en metálico salvo extinción." },
            { label: "Jornada máxima", texto: "40 horas semanales de promedio anual. Máximo 9 horas diarias ordinarias y 80 horas extraordinarias al año." },
            { label: "Descanso mínimo", texto: "12 horas entre jornadas. 1,5 días de descanso semanal (generalmente sábado tarde + domingo)." },
            { label: "Preaviso de despido", texto: "El despido objetivo requiere 15 días de preaviso. El disciplinario, carta entregada en mano." },
            { label: "Modificación sustancial", texto: "15 días de preaviso si la empresa cambia jornada, horario, turnos, salario o funciones." },
            { label: "Salario mínimo", texto: "El SMI se actualiza anualmente por Decreto. En 2025: 1.134 €/mes en 14 pagas." },
        ],
        enlaceInterno: "/intranet/works-council/contract-info",
        enlaceInternoLabel: "Guía de contratos →",
    },
    {
        title: "Convenio Colectivo — Agencias de Viajes",
        href: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-18929",
        color: "#0f766e",
        bg: "#f0fdfa",
        border: "#99f6e4",
        icon: "✈️",
        resumen: "Marco sectorial aplicable a empresas de organización de experiencias y viajes grupales.",
        pildoras: [
            { label: "Grupos profesionales", texto: "Clasifica los puestos en 5 grupos: directivo, técnico, administrativo, operativo y auxiliar. Determina el salario base." },
            { label: "Salario base mínimo", texto: "Varía según grupo profesional. El convenio puede mejorar el SMI general. Consulta la tabla salarial actualizada." },
            { label: "Jornada sectorial", texto: "38,5 horas semanales de promedio anual en muchos ámbitos del sector, inferior al máximo legal." },
            { label: "Plus de transporte", texto: "El convenio recoge complementos extrasalariales como plus transporte y ropa de trabajo según categoría." },
            { label: "Formación continua", texto: "Mínimo de horas formativas al año costeadas por la empresa. El comité vela por su cumplimiento." },
            { label: "Período de prueba", texto: "Técnicos titulados: 6 meses. Resto trabajadores: 2 meses. Personal no cualificado: 1 mes." },
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
        href: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-16660",
        color: "#7c3aed",
        bg: "#f5f3ff",
        border: "#ddd6fe",
        icon: "🤝",
        resumen: "Garantiza el derecho a sindicarse, crear sindicatos y ejercer la acción sindical en la empresa.",
        pildoras: [
            { label: "Derecho a afiliarse", texto: "Todo trabajador puede afiliarse al sindicato que desee. La empresa no puede penalizarlo ni discriminarlo por ello." },
            { label: "Crédito horario", texto: "Los delegados sindicales tienen horas mensuales retribuidas para ejercer sus funciones (15–40 h según plantilla)." },
            { label: "Elecciones sindicales", texto: "Cada 4 años se celebran elecciones para elegir al comité de empresa o delegados de personal." },
            { label: "Acción sindical", texto: "Los sindicatos pueden difundir información en la empresa, negociar colectivamente y convocar huelga." },
            { label: "Garantías del delegado", texto: "Protección frente al despido, traslado forzoso o sanción por ejercer sus funciones sindicales." },
            { label: "Huelga legal", texto: "Derecho fundamental. Debe comunicarse con 5 días de preaviso (10 en servicios esenciales)." },
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
