import type { WishItem } from "@/api";

const formatPrice = (item: WishItem): string =>
  new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: item.currency,
  }).format(item.priceMinor / 100);

export function WishItemRow({ item }: { item: WishItem }): React.JSX.Element {
  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <span className="font-medium">{item.title}</span>
      <span className="shrink-0 text-ink-soft tabular-nums">
        {formatPrice(item)}
      </span>
    </li>
  );
}
