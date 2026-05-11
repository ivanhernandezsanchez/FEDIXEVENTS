import type { Activity } from "./types";

const categoryImages = [
  {
    match: /kart|motor|aventura|paintball|extremo|quad|buggy/i,
    url: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=900&q=80",
  },
  {
    match: /cena|gastro|comida|restaurante|tapas|beer|cerveza/i,
    url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80",
  },
  {
    match: /barco|playa|mar|boat|yate/i,
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
  {
    match: /relax|spa|premium|vip|limusina/i,
    url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=80",
  },
  {
    match: /noche|fiesta|party|discoteca|club/i,
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
  },
];

export const defaultActivityImage =
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80";

export const getActivityImage = (activity?: Pick<Activity, "category" | "name"> | null) => {
  const haystack = `${activity?.category ?? ""} ${activity?.name ?? ""}`;
  return categoryImages.find((item) => item.match.test(haystack))?.url ?? defaultActivityImage;
};

export const renderStars = (value?: number | string | null) => {
  const rating = Number(value) || 0;
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
};
