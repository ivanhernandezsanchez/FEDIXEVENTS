import { useEffect, useState } from "react";
import type { Activity } from "../../types";

interface ProductForm {
  id?: number;
  city_id: string;
  provider_id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  duration_minutes: string;
  max_capacity: string;
}

interface AiPlanSubmission {
  id: number;
  suggested_name: string;
  city_id: number | null;
  city_name?: string | null;
  description: string;
  category: string;
  suggested_price: number | string;
  max_capacity?: number | null;
  duration_minutes?: number | null;
  status: "pending" | "approved" | "rejected";
  created_activity_id?: number | null;
}

const emptyForm: ProductForm = {
  city_id: "1",
  provider_id: "",
  name: "",
  description: "",
  category: "",
  price: "",
  duration_minutes: "",
  max_capacity: "",
};

function Products() {
  const [products, setProducts] = useState<Activity[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [submissions, setSubmissions] = useState<AiPlanSubmission[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    const res = await fetch("/api/activities");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  const loadSubmissions = async () => {
    const res = await fetch("/api/ai-plan-submissions", {
      credentials: "include",
    });
    const data = await res.json();
    setSubmissions(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    Promise.all([loadProducts(), loadSubmissions()]).catch(() => setError("No se pudieron cargar los productos"));
  }, []);

  const updateField = (field: keyof ProductForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const editProduct = (product: Activity) => {
    setForm({
      id: product.id,
      city_id: String(product.city_id ?? 1),
      provider_id: String(product.provider_id ?? ""),
      name: product.name,
      description: product.description,
      category: product.category,
      price: String(product.price),
      duration_minutes: String(product.duration_minutes ?? ""),
      max_capacity: String(product.max_capacity ?? ""),
    });
  };

  const saveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(form.id ? `/api/activities/${form.id}` : "/api/activities", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          city_id: Number(form.city_id),
          provider_id: form.provider_id ? Number(form.provider_id) : null,
          name: form.name,
          description: form.description,
          category: form.category,
          price: Number(form.price),
          duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
          max_capacity: form.max_capacity ? Number(form.max_capacity) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar el producto");
        return;
      }

      setForm(emptyForm);
      await loadProducts();
    } catch {
      setError("Error al conectar con el servidor");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm("¿Eliminar este producto?")) return;

    const res = await fetch(`/api/activities/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo eliminar el producto");
      return;
    }

    await loadProducts();
  };

  const approveSubmission = async (id: number) => {
    const res = await fetch(`/api/ai-plan-submissions/${id}/approve`, {
      method: "PATCH",
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "No se pudo aprobar la propuesta");
      return;
    }

    await Promise.all([loadProducts(), loadSubmissions()]);
  };

  const rejectSubmission = async (id: number) => {
    const res = await fetch(`/api/ai-plan-submissions/${id}/reject`, {
      method: "PATCH",
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "No se pudo rechazar la propuesta");
      return;
    }

    await loadSubmissions();
  };

  const deleteSubmission = async (id: number) => {
    if (!window.confirm("¿Eliminar esta propuesta definitivamente?")) return;
    const res = await fetch(`/api/ai-plan-submissions/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo eliminar la propuesta");
      return;
    }
    await loadSubmissions();
  };

  const statusLabel: Record<string, string> = { pending: "Pendiente", approved: "Aprobada", rejected: "Rechazada" };

  return (
    <div>
      <h2>Gestión de Productos</h2>
      <p>Alta, edición y baja de actividades del catálogo.</p>
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      <section style={styles.submissions}>
        <h3>Propuestas IA ({submissions.length})</h3>
        {submissions.length === 0 ? (
          <p style={styles.muted}>No hay propuestas.</p>
        ) : (
          <div style={styles.submissionList}>
            {submissions.map((submission) => (
              <article key={submission.id} style={styles.submissionCard}>
                <div>
                  <strong>{submission.suggested_name}</strong>
                  <p style={styles.muted}>
                    {submission.city_name || `sin ciudad`} · {submission.category} ·{" "}
                    {Number(submission.suggested_price) > 0
                      ? `${Number(submission.suggested_price).toFixed(2)} €`
                      : "Presupuesto pendiente"}
                    {" · "}
                    <span style={{ fontWeight: 700, color: submission.status === "approved" ? "#16a34a" : submission.status === "rejected" ? "#dc2626" : "#d97706" }}>
                      {statusLabel[submission.status] ?? submission.status}
                    </span>
                  </p>
                </div>
                <div style={styles.submissionActions}>
                  {submission.status === "pending" && (
                    <>
                      <button onClick={() => approveSubmission(submission.id)} style={styles.primary}>Aprobar y publicar</button>
                      <button onClick={() => rejectSubmission(submission.id)} style={styles.secondary}>Rechazar</button>
                    </>
                  )}
                  <button onClick={() => deleteSubmission(submission.id)} style={styles.danger}>Eliminar</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <form onSubmit={saveProduct} style={styles.form}>
        <input required placeholder="Nombre" value={form.name} onChange={(e) => updateField("name", e.target.value)} style={styles.input} />
        <input required placeholder="Categoría" value={form.category} onChange={(e) => updateField("category", e.target.value)} style={styles.input} />
        <input required type="number" min="0" step="0.01" placeholder="Precio" value={form.price} onChange={(e) => updateField("price", e.target.value)} style={styles.input} />
        <input required type="number" min="1" placeholder="Ciudad ID" value={form.city_id} onChange={(e) => updateField("city_id", e.target.value)} style={styles.input} />
        <input type="number" min="1" placeholder="Proveedor ID" value={form.provider_id} onChange={(e) => updateField("provider_id", e.target.value)} style={styles.input} />
        <input type="number" min="1" placeholder="Duración min." value={form.duration_minutes} onChange={(e) => updateField("duration_minutes", e.target.value)} style={styles.input} />
        <input type="number" min="1" placeholder="Capacidad máxima" value={form.max_capacity} onChange={(e) => updateField("max_capacity", e.target.value)} style={styles.input} />
        <textarea required placeholder="Descripción" value={form.description} onChange={(e) => updateField("description", e.target.value)} style={styles.textarea} />
        <div style={styles.actions}>
          <button disabled={saving} style={styles.primary}>{form.id ? "Actualizar" : "Crear producto"}</button>
          {form.id && <button type="button" onClick={() => setForm(emptyForm)} style={styles.secondary}>Cancelar edición</button>}
        </div>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.cell}>ID</th>
            <th style={styles.cell}>Nombre</th>
            <th style={styles.cell}>Categoría</th>
            <th style={styles.cell}>Precio</th>
            <th style={styles.cell}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td style={styles.cell}>{product.id}</td>
              <td style={styles.cell}>{product.name}</td>
              <td style={styles.cell}>{product.category}</td>
              <td style={styles.cell}>{Number(product.price).toFixed(2)} €</td>
              <td style={styles.cell}>
                <button onClick={() => editProduct(product)} style={styles.secondary}>Editar</button>
                <button onClick={() => deleteProduct(product.id)} style={styles.danger}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  submissions: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    marginBottom: 24,
    padding: 16,
  },
  submissionList: {
    display: "grid",
    gap: 12,
  },
  submissionCard: {
    background: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    display: "grid",
    gap: 12,
    gridTemplateColumns: "minmax(0, 1fr) auto",
    padding: 14,
  },
  submissionText: {
    color: "#374151",
    lineHeight: 1.45,
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  submissionActions: {
    alignItems: "end",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  muted: {
    color: "#6b7280",
    lineHeight: 1.45,
    margin: "6px 0",
  },
  form: {
    display: "grid",
    gap: 10,
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    marginBottom: 24,
  },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 6,
    padding: 10,
  },
  textarea: {
    border: "1px solid #d1d5db",
    borderRadius: 6,
    gridColumn: "1 / -1",
    minHeight: 90,
    padding: 10,
  },
  actions: {
    display: "flex",
    gap: 8,
    gridColumn: "1 / -1",
  },
  primary: {
    background: "#2563eb",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    padding: "10px 14px",
  },
  secondary: {
    background: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    cursor: "pointer",
    marginRight: 8,
    padding: "8px 12px",
  },
  danger: {
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: 6,
    color: "#b91c1c",
    cursor: "pointer",
    padding: "8px 12px",
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
  },
  cell: {
    borderBottom: "1px solid #e5e7eb",
    padding: 10,
    textAlign: "left",
  },
};

export default Products;
