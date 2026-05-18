import type { CartItem } from "../types";

interface Props {
    cart: CartItem[];
    onUpdateQuantity: (productId: number, delta: number) => void;
    onRemove: (productId: number) => void;
    onConfirm: () => void;
}

function CartSummary({ cart, onUpdateQuantity, onRemove, onConfirm }: Props) {
    const total = cart.reduce(
        (acc, item) => acc + Number(item.product.price) * item.quantity,
        0
    );

    if (cart.length === 0) {
        return <p style={{ color: "#999" }}>The cart is empty.</p>;
    }

    return (
        <div>
            {cart.map((item) => (
                <div key={item.product.id} style={{ marginBottom: 10 }}>
                    <b>{item.product.name}</b>

                    <p>
                        {item.quantity} x {Number(item.product.price).toFixed(2)} € ={" "}
                        {(item.quantity * Number(item.product.price)).toFixed(2)} €
                    </p>

                    <button onClick={() => onUpdateQuantity(item.product.id, -1)}>
                        −
                    </button>

                    <button onClick={() => onUpdateQuantity(item.product.id, 1)}>
                        +
                    </button>

                    <button onClick={() => onRemove(item.product.id)}>✕</button>
                </div>
            ))}

            <h3>Total: {total.toFixed(2)} €</h3>

            <button
                onClick={onConfirm}
                disabled={cart.length === 0}
                style={{ marginTop: 10 }}
            >
                🧾 Checkout
            </button>
        </div>
    );
}

export default CartSummary;
