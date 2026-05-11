import type { Activity, CartItem } from "./types";

const CART_KEY = "cart";

export const readCart = (): CartItem[] => {
  const raw = sessionStorage.getItem(CART_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCart = (cart: CartItem[]) => {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
};

export const addActivityToCart = (activity: Activity) => {
  const cart = readCart();
  const existing = cart.find((item) => item.product.id === activity.id);

  const nextCart = existing
    ? cart.map((item) =>
        item.product.id === activity.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    : [...cart, { product: activity, quantity: 1 }];

  saveCart(nextCart);
  return nextCart;
};

export const addCustomPlanToCart = (activity: Activity, quantity: number) => {
  const cart = readCart();
  const customItem: CartItem = {
    product: activity,
    quantity: Math.max(1, Math.min(99, quantity)),
    customPlan: true,
  };

  const nextCart = [...cart, customItem];

  saveCart(nextCart);
  return nextCart;
};
