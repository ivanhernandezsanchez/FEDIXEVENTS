import { useState, useEffect } from "react";
import { useUser } from "../../UserContext";

type UserRole = "customer" | "employee" | "admin";

interface ManagedUser {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    full_name?: string;
}

interface UserForm {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}

function Users() {
    const { user } = useUser();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [error, setError] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState<UserForm>({
        email: "",
        password: "",
        name: "",
        role: "customer"
    });
    const [creating, setCreating] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editUser, setEditUser] = useState<ManagedUser | null>(null);
    const [updating, setUpdating] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users", {
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "No se pudieron cargar los usuarios");
                return;
            }
            if (Array.isArray(data)) setUsers(data);
        } catch (e) {
            console.error(e);
            setError("Error al conectar con el servidor");
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError("");

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(createForm)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Error al crear usuario");
                return;
            }

            setUsers(prev => [...prev, data.user]);
            setCreateForm({ email: "", password: "", name: "", role: "customer" });
            setShowCreateForm(false);
        } catch (e) {
            console.error(e);
            setError("Error al conectar con el servidor");
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
            return;
        }

        setError("");

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Error al eliminar usuario");
                return;
            }

            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (e) {
            console.error(e);
            setError("Error al conectar con el servidor");
        }
    };

    const handleEditUser = (user: ManagedUser) => {
        setEditUser({ ...user });
        setEditModal(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setError("");

        if (!editUser) return;

        try {
            const res = await fetch(`/api/users/${editUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: editUser.email,
                    name: editUser.name,
                    role: editUser.role
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Error al actualizar usuario");
                return;
            }

            setUsers(prev => prev.map(u => u.id === editUser.id ? data.user : u));
            setEditModal(false);
            setEditUser(null);
        } catch (e) {
            console.error(e);
            setError("Error al conectar con el servidor");
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const isAdmin = user?.role === "admin";

    return (
        <>
            <div>
                <h2>Gestión de Usuarios</h2>
                <p>Administración del personal y clientes de la plataforma.</p>
                {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

                {isAdmin && (
                    <div style={{ marginBottom: 20 }}>
                        <button 
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            style={{ background: "#3b82f6", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}
                        >
                            {showCreateForm ? "Cancelar" : "Crear Usuario"}
                        </button>
                    </div>
                )}

                {showCreateForm && isAdmin && (
                    <form onSubmit={handleCreateUser} style={{ marginBottom: 20, padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
                        <h3>Crear Nuevo Usuario</h3>
                        <div style={{ marginBottom: 10 }}>
                            <label>Email: </label>
                            <input
                                type="email"
                                value={createForm.email}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                                required
                                style={{ marginLeft: 10, padding: 5, width: 200 }}
                            />
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <label>Contraseña: </label>
                            <input
                                type="password"
                                value={createForm.password}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                                required
                                style={{ marginLeft: 10, padding: 5, width: 200 }}
                            />
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <label>Nombre: </label>
                            <input
                                type="text"
                                value={createForm.name}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                style={{ marginLeft: 10, padding: 5, width: 200 }}
                            />
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <label>Rol: </label>
                            <select
                                value={createForm.role}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                                style={{ marginLeft: 10, padding: 5, width: 200 }}
                            >
                                <option value="customer">Cliente</option>
                                <option value="employee">Empleado</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            disabled={creating}
                            style={{ background: "#10b981", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}
                        >
                            {creating ? "Creando..." : "Crear Usuario"}
                        </button>
                    </form>
                )}

                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", marginTop: 20 }}>
                    <thead>
                        <tr style={{ background: "#f3f4f6" }}>
                            <th style={{ padding: 10 }}>ID</th>
                            <th style={{ padding: 10 }}>Nombre</th>
                            <th style={{ padding: 10 }}>Email</th>
                            <th style={{ padding: 10 }}>Rol</th>
                            <th style={{ padding: 10 }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: 10 }}>No hay usuarios (o no tienes permiso admin).</td></tr>
                        ) : (
                            users.map(u => (
                                <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: 10 }}>{u.id}</td>
                                    <td style={{ padding: 10 }}>{u.name || u.full_name}</td>
                                    <td style={{ padding: 10 }}>{u.email}</td>
                                    <td style={{ padding: 10 }}>{u.role || "customer"}</td>
                                    <td style={{ padding: 10 }}>
                                        <button 
                                            onClick={() => handleEditUser(u)}
                                            style={{ background: "transparent", border: "1px solid #ccc", padding: "4px 8px", cursor: "pointer", marginRight: 5 }}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(u.id)}
                                            style={{ background: "#fee2e2", color: "#ef4444", border: "1px solid #fca5a5", padding: "4px 8px", cursor: "pointer" }}
                                        >
                                            Borrar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {editModal && editUser && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        background: "white",
                        padding: 30,
                        borderRadius: 8,
                        width: 400,
                        maxWidth: "90%"
                    }}>
                        <h3>Editar Usuario</h3>
                        <form onSubmit={handleUpdateUser}>
                            <div style={{ marginBottom: 15 }}>
                                <label>Email: </label>
                                <input
                                    type="email"
                                    value={editUser.email}
                                    onChange={(e) => setEditUser((prev: ManagedUser | null) => prev ? ({ ...prev, email: e.target.value }) : prev)}
                                    required
                                    style={{ width: "100%", padding: 8, marginTop: 5 }}
                                />
                            </div>
                            <div style={{ marginBottom: 15 }}>
                                <label>Nombre: </label>
                                <input
                                    type="text"
                                    value={editUser.name ?? editUser.full_name ?? ""}
                                    onChange={(e) => setEditUser((prev: ManagedUser | null) => prev ? ({ ...prev, name: e.target.value }) : prev)}
                                    required
                                    style={{ width: "100%", padding: 8, marginTop: 5 }}
                                />
                            </div>
                            <div style={{ marginBottom: 15 }}>
                                <label>Rol: </label>
                                <select
                                    value={editUser.role}
                                    onChange={(e) => setEditUser((prev: ManagedUser | null) => prev ? ({ ...prev, role: e.target.value as UserRole }) : prev)}
                                    style={{ width: "100%", padding: 8, marginTop: 5 }}
                                >
                                    <option value="customer">Cliente</option>
                                    <option value="employee">Empleado</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                <button
                                    type="button"
                                    onClick={() => setEditModal(false)}
                                    style={{ padding: "8px 16px", background: "#6b7280", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    style={{ padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
                                >
                                    {updating ? "Actualizando..." : "Actualizar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Users;
