import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types";

interface CartItem {
    product: Product;
    quantity: number;
}

function Checkout({
    cart,
    clearCart,
}: {
    cart: CartItem[];
    clearCart: () => void;
}) {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    const total = useMemo(
        () =>
            cart.reduce(
                (acc, item) => acc + item.product.price * item.quantity,
                0
            ),
        [cart]
    );

    const isValid = name && email && address && cart.length > 0;

    const handleConfirm = () => {
        alert("🎉 Pedido realizado con éxito");

        clearCart();
        navigate("/");
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f6fa",
                padding: 30,
                fontFamily: "Arial",
            }}
        >
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                {/* HEADER */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <h1>🧾 Checkout</h1>

                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: "8px 14px",
                            borderRadius: 8,
                            border: "none",
                            background: "#e5e7eb",
                            cursor: "pointer",
                        }}
                    >
                        ← Volver
                    </button>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 20,
                        marginTop: 20,
                    }}
                >
                    {/* 🛒 RESUMEN */}
                    <div
                        style={{
                            background: "white",
                            padding: 20,
                            borderRadius: 14,
                            boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
                        }}
                    >
                        <h2>🛒 Tu pedido</h2>

                        {cart.length === 0 ? (
                            <p style={{ color: "#999" }}>
                                El carrito está vacío
                            </p>
                        ) : (
                            cart.map((item) => (
                                <div
                                    key={item.product.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "10px 0",
                                        borderBottom: "1px solid #eee",
                                    }}
                                >
                                    <div>
                                        <b>{item.product.name}</b>
                                        <div style={{ fontSize: 12, color: "#666" }}>
                                            {item.quantity} unidades
                                        </div>
                                    </div>

                                    <b>
                                        {(
                                            item.product.price *
                                            item.quantity
                                        ).toFixed(2)}{" "}
                                        €
                                    </b>
                                </div>
                            ))
                        )}

                        <h2 style={{ marginTop: 15 }}>
                            Total:{" "}
                            <span style={{ color: "#16a34a" }}>
                                {total.toFixed(2)} €
                            </span>
                        </h2>
                    </div>

                    {/* 📝 FORM */}
                    <div
                        style={{
                            background: "white",
                            padding: 20,
                            borderRadius: 14,
                            boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
                        }}
                    >
                        <h2>📦 Datos de envío</h2>

                        <input
                            placeholder="Nombre completo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={input}
                        />

                        <input
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={input}
                        />

                        <input
                            placeholder="Dirección"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            style={input}
                        />

                        <button
                            disabled={!isValid}
                            onClick={handleConfirm}
                            style={{
                                width: "100%",
                                marginTop: 15,
                                padding: 12,
                                borderRadius: 10,
                                border: "none",
                                cursor: isValid ? "pointer" : "not-allowed",
                                background: isValid ? "#16a34a" : "#ccc",
                                color: "white",
                                fontWeight: "bold",
                            }}
                        >
                            Confirmar pedido
                        </button>

                        {!isValid && (
                            <p style={{ fontSize: 12, color: "#999", marginTop: 10 }}>
                                Rellena todos los campos para continuar
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const input: React.CSSProperties = {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    outline: "none",
};

export default Checkout;