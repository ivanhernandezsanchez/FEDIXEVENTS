import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useUser } from "../../UserContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useUser();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const loggedUser = await login(email, password);
            const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
            const fallbackPath = loggedUser.role === "admin" ? "/intranet/dashboard" : "/";
            const targetPath = fromPath && (loggedUser.role === "admin" || !fromPath.startsWith("/intranet"))
                ? fromPath
                : fallbackPath;

            navigate(targetPath, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al iniciar sesión");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <h2>Iniciar Sesión</h2>
            {error && <p style={{ color: "red", background: "#fee2e2", padding: 10 }}>{error}</p>}

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                />
                <button type="submit" style={{ padding: 12, background: "#111827", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
                    Ingresar
                </button>
            </form>

            <p style={{ marginTop: 20 }}>
                ¿No tienes cuenta? <Link to="/intranet/register">Regístrate aquí</Link>
            </p>
        </div>
    );
}

export default Login;
