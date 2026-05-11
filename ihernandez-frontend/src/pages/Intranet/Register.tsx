import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Notice it needs 'name' because backend index.ts says 'name' in query
                body: JSON.stringify({ email, password, name })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al registrarse");

            alert("Registro exitoso. Inicia sesión ahora.");
            navigate("/intranet/login");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al registrarse");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <h2>Registro - Intranet</h2>
            {error && <p style={{ color: "red", background: "#fee2e2", padding: 10 }}>{error}</p>}

            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={{ padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                />
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
                <button type="submit" style={{ padding: 12, background: "#3b82f6", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
                    Registrarme
                </button>
            </form>

            <p style={{ marginTop: 20 }}>
                ¿Ya tienes cuenta? <Link to="/intranet/login">Inicia sesión</Link>
            </p>
        </div>
    );
}

export default Register;
