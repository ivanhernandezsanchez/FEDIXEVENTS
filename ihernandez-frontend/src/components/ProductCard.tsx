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
        border: "1px solid rgba(168, 85, 247, 0.2)",
        borderRadius: 14,
        padding: 15,
        background: "rgba(30, 27, 75, 0.55)",
        boxShadow: "0 8px 24px rgba(46, 16, 101, 0.25)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "0.2s",
        color: "#F3F4F6",
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
      <h3 style={{ margin: 0, color: "#F3F4F6" }}>{product.name}</h3>

      {/* PRICE */}
      <p style={{ fontSize: 16, fontWeight: "bold", margin: 0, color: "#F97316" }}>
        {Number(product.price).toFixed(2)} €
      </p>

      {/* ⭐ RATING */}
      <p style={{ margin: 0, fontSize: 14, color: "#F97316" }}>
        {hasRating ? (
          <>
            {renderStars(safeRating)} ({safeRating.toFixed(1)})
          </>
        ) : (
          <span style={{ color: "#6b7280" }}>No ratings</span>
        )}
      </p>

      {/* STOCK */}
      <p
        style={{
          fontSize: 13,
          color: product.stock > 0 ? "#34d399" : "#FB7185",
          margin: 0,
        }}
      >
        {product.stock > 0
          ? `In stock - ${product.stock}`
          : "Out of stock"}
      </p>

      {/* 🛒 BUTTON */}
      <button
        disabled={isDisabled}
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart?.(product);
        }}
        style={{
          marginTop: 10,
          width: "100%",
          padding: "10px 12px",
          borderRadius: 999,
          border: "none",
          fontWeight: 600,
          fontSize: 14,
          background: isDisabled ? "rgba(168, 85, 247, 0.1)" : "linear-gradient(135deg, #DB2777, #F97316)",
          color: isDisabled ? "#6b7280" : "white",
          cursor: isDisabled ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {isDisabled ? "Not available" : "🛒 Add to cart"}
      </button>
    </div>
  );
}

export default ProductCard;
