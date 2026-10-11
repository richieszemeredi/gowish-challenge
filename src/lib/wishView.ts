import type { WishItem } from "@/api";

export type SortOrder = "recommended" | "price-asc" | "price-desc";

export type WishView = { availableOnly: boolean; sort: SortOrder };

export const DEFAULT_VIEW: WishView = {
  availableOnly: false,
  sort: "recommended",
};

export function applyView(
  items: WishItem[],
  { availableOnly, sort }: WishView,
): WishItem[] {
  const visible = availableOnly
    ? items.filter((item) => item.reservedBy === null)
    : items;
  if (sort === "recommended") return visible;
  const direction = sort === "price-asc" ? 1 : -1;
  // Array.prototype.sort is stable, so equal prices keep the list's order.
  return [...visible].sort((a, b) => (a.priceMinor - b.priceMinor) * direction);
}
