import type { WishItem } from "@/api";

const formatPrice = (item: WishItem): string =>
  new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: item.currency,
  }).format(item.priceMinor / 100);

export function WishItemRow({
  item,
  animate = false,
}: {
  item: WishItem;
  animate?: boolean;
}): React.JSX.Element {
  return (
    <li
      className={`flex items-center justify-between gap-4 py-4 ${animate ? "motion-safe:transition motion-safe:duration-300 motion-safe:starting:-translate-y-2 motion-safe:starting:opacity-0" : ""}`}
    >
      <span className="font-medium">{item.title}</span>
      <span className="shrink-0 text-ink-soft tabular-nums">
        {formatPrice(item)}
      </span>
    </li>
  );
}
