import type { Product } from "../types";

interface ProductCardProps {
  product: Product & { avgRating?: number | string | null };
  onSelect?: (id: number) => void;
  onAddToCart?: (product: Product) => void;
}

function ProductCard({ product, onSelect, onAddToCart }: ProductCardProps) {
  // 🔥 FIX: añadir active
  const isDisabled = product.stock <= 0 || !product.active;

  const rating = Number(product.avgRating);

  const hasRating =
    product.avgRating !== null &&
    product.avgRating !== undefined &&
    !isNaN(rating);

  const safeRating = hasRating ? rating : 0;

  const renderStars = (value: number) => {
    const rounded = Math.round(value);
    return "★".repeat(rounded) + "☆".repeat(5 - rounded);
  };

  return (
    <div
      onClick={() => onSelect?.(product.id)}
      style={{
        cursor: "pointer",
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 15,
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "0.2s",
      }}
    >
      {/* IMG */}
      <img
        src={product.image_url ?? product.imageUrl ?? "https://placehold.co/200x200"}
        alt={product.name}
        style={{
          width: "100%",
          height: 180,
          objectFit: "cover",
          borderRadius: 12,
        }}
      />

      {/* NAME */}
      <h3 style={{ margin: 0 }}>{product.name}</h3>

      {/* PRICE */}
      <p style={{ fontSize: 16, fontWeight: "bold", margin: 0 }}>
        {Number(product.price).toFixed(2)} €
      </p>

      {/* ⭐ RATING */}
      <p style={{ margin: 0, fontSize: 14, color: "#f59e0b" }}>
        {hasRating ? (
          <>
            {renderStars(safeRating)} ({safeRating.toFixed(1)})
          </>
        ) : (
          "Sin valoraciones"
        )}
      </p>

      {/* STOCK */}
      <p
        style={{
          fontSize: 13,
          color: product.stock > 0 ? "#16a34a" : "#dc2626",
          margin: 0,
        }}
      >
        {product.stock > 0
          ? `En stock - ${product.stock}`
          : "Sin stock"}
      </p>

      {/* 🛒 BUTTON */}
      <button
        disabled={isDisabled} // ✅ FIX IMPORTANTE
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart?.(product);
        }}
        style={{
          marginTop: 10,
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "none",
          fontWeight: 600,
          fontSize: 14,
          background: isDisabled ? "#e5e5e5" : "#111827",
          color: isDisabled ? "#888" : "white",
          cursor: isDisabled ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {isDisabled ? "No disponible" : "🛒 Añadir al carrito"}
      </button>
    </div>
  );
}

export default ProductCard;
