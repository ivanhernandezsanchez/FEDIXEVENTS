import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const css = `
    .auth-root {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: flex;
        background: #0d0614;
        font-family: 'Trebuchet MS', Arial, sans-serif;
    }
    .auth-left {
        display: none;
        width: 52%;
        position: relative;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2.5rem 3rem;
        border-radius: 1.5rem;
        overflow: hidden;
        background: linear-gradient(135deg, #1d1028 0%, #2E1065 45%, #9d174d 100%);
        margin: 0.75rem;
        box-shadow: 0 24px 60px rgba(0,0,0,0.6);
    }
    @media (min-width: 1024px) {
        .auth-left { display: flex; }
    }
    .auth-left-noise {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(circle at 20% 80%, rgba(249,115,22,0.18) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(219,39,119,0.22) 0%, transparent 50%);
        pointer-events: none;
    }
    .auth-left-inner {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        width: 100%;
        max-width: 340px;
        position: relative;
        z-index: 10;
    }
    .auth-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #fff;
        animation: fadeSlideUp 0.5s ease both;
        animation-delay: 100ms;
    }
    .auth-heading-block {
        animation: fadeSlideUp 0.5s ease both;
        animation-delay: 220ms;
    }
    .auth-steps {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .auth-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem 1.5rem;
        overflow-y: auto;
    }
    .auth-form-container {
        width: 100%;
        max-width: 420px;
        animation: fadeIn 0.7s ease both;
    }
    .auth-input {
        width: 100%;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        height: 48px;
        padding: 0 1rem;
        color: #fff;
        font-size: 0.95rem;
        font-family: 'Trebuchet MS', Arial, sans-serif;
        transition: box-shadow 0.2s, border-color 0.2s;
        box-sizing: border-box;
    }
    .auth-input::placeholder { color: rgba(255,255,255,0.22); }
    .auth-input:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(219,39,119,0.35);
        border-color: rgba(219,39,119,0.5);
    }
    .auth-submit {
        width: 100%;
        height: 52px;
        background: linear-gradient(135deg, #DB2777, #F97316);
        color: #fff;
        border: none;
        border-radius: 12px;
        font-weight: 900;
        font-size: 1rem;
        font-family: 'Arial Black', 'Trebuchet MS', Arial, sans-serif;
        cursor: pointer;
        transition: opacity 0.2s, transform 0.15s;
        margin-top: 0.5rem;
    }
    .auth-submit:hover:not(:disabled) { opacity: 0.9; transform: scale(0.99); }
    .auth-submit:active:not(:disabled) { transform: scale(0.97); }
    .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-step-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 14px;
        border-radius: 12px;
        animation: fadeSlideUp 0.5s ease both;
    }
    .auth-step-item.active {
        background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.22);
    }
    .auth-step-item.inactive {
        background: rgba(255,255,255,0.04);
        border: 1px solid transparent;
    }
    .auth-eye-btn {
        position: absolute;
        right: 13px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: rgba(255,255,255,0.35);
        padding: 0;
        display: flex;
        align-items: center;
        font-size: 1.05rem;
        transition: color 0.15s;
    }
    .auth-eye-btn:hover { color: rgba(255,255,255,0.7); }
    .auth-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
    }
`;

function StepItem({ number, text, active, delay }: { number: number; text: string; active?: boolean; delay: number }) {
    return (
        <div className={`auth-step-item ${active ? "active" : "inactive"}`} style={{ animationDelay: `${delay}ms` }}>
            <div style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.78rem", fontWeight: 900, flexShrink: 0,
                background: active ? "linear-gradient(135deg, #DB2777, #F97316)" : "rgba(255,255,255,0.08)",
                color: active ? "#fff" : "rgba(255,255,255,0.35)",
            }}>
                {number}
            </div>
            <span style={{
                fontSize: "0.88rem",
                fontWeight: active ? 700 : 400,
                color: active ? "#fff" : "rgba(255,255,255,0.45)",
            }}>
                {text}
            </span>
        </div>
    );
}

function Register() {
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        setLoading(true);
        try {
            const fullName = lastName ? `${name} ${lastName}`.trim() : name;
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name: fullName }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al registrarse");

            navigate("/intranet/login", { state: { registered: true } });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al registrarse");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{css}</style>
            <div className="auth-root">

                {/* ── LEFT COLUMN ── */}
                <div className="auth-left">
                    <div className="auth-left-noise" />
                    <div className="auth-left-inner">

                        <div className="auth-logo">
                            <div style={{ background: "#fff", borderRadius: 12, padding: "6px 14px", display: "inline-flex" }}>
                                <img src="/logo.png" alt="FedixEvents" style={{ height: 64 }} />
                            </div>
                        </div>

                        <div className="auth-heading-block">
                            <h1 style={{ fontSize: "2.4rem", fontWeight: 900, lineHeight: 1.1, margin: 0, color: "#fff" }}>
                                Únete a<br />FedixEvents
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem", lineHeight: 1.65, marginTop: "0.7rem" }}>
                                3 pasos rápidos para empezar a organizar la despedida perfecta.
                            </p>
                        </div>

                        <div className="auth-steps">
                            <StepItem number={1} text="Crea tu cuenta" active delay={340} />
                            <StepItem number={2} text="Accede al catálogo" delay={440} />
                            <StepItem number={3} text="Reserva actividades" delay={540} />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="auth-right">
                    <div className="auth-form-container">

                        <div style={{ marginBottom: "2rem" }}>
                            <span style={{
                                fontSize: "0.75rem", fontWeight: 800, color: "#DB2777",
                                textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "0.5rem",
                            }}>
                                FedixEvents
                            </span>
                            <h2 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, color: "#fff", letterSpacing: "-0.02em" }}>
                                Crear nueva cuenta
                            </h2>
                            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.88rem", marginTop: "0.4rem" }}>
                                Introduce tus datos para comenzar la aventura.
                            </p>
                        </div>

                        {error && (
                            <div style={{
                                background: "rgba(220,38,38,0.14)",
                                border: "1px solid rgba(220,38,38,0.35)",
                                borderRadius: 10,
                                padding: "0.85rem 1rem",
                                color: "#fca5a5",
                                fontSize: "0.88rem",
                                marginBottom: "1.5rem",
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                            <div className="auth-grid-2">
                                <div>
                                    <label style={labelStyle}>Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Ana"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        className="auth-input"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Apellido</label>
                                    <input
                                        type="text"
                                        placeholder="García"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        className="auth-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Email</label>
                                <input
                                    type="email"
                                    placeholder="tucorreo@ejemplo.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="auth-input"
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Contraseña</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Mínimo 8 caracteres"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="auth-input"
                                        style={{ paddingRight: "3rem" }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="auth-eye-btn"
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                                <p style={{ marginTop: "0.35rem", fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>
                                    Requiere al menos 8 caracteres.
                                </p>
                            </div>

                            <button type="submit" disabled={loading} className="auth-submit">
                                {loading ? "Creando cuenta..." : "Crear cuenta"}
                            </button>
                        </form>

                        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
                            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.88rem", margin: 0 }}>
                                ¿Ya tienes cuenta?{" "}
                                <Link to="/intranet/login" style={{ color: "#DB2777", fontWeight: 700, textDecoration: "none" }}>
                                    Inicia sesión
                                </Link>
                            </p>
                            <Link to="/" style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.82rem", textDecoration: "none" }}>
                                ← Volver a la tienda
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.45rem",
    fontSize: "0.84rem",
    fontWeight: 700,
    color: "rgba(255,255,255,0.65)",
};

export default Register;
