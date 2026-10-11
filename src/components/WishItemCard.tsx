import type { WishItem } from "@/api";
import { ReservationBadge } from "./ReservationBadge";

const formatPrice = (item: WishItem): string =>
  new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: item.currency,
  }).format(item.priceMinor / 100);

export function WishItemCard({
  item,
  animate = false,
}: {
  item: WishItem;
  animate?: boolean;
}): React.JSX.Element {
  return (
    <li
      className={`flex flex-col overflow-hidden rounded-card border border-line bg-card ${animate ? "motion-safe:transition motion-safe:duration-300 motion-safe:starting:-translate-y-2 motion-safe:starting:opacity-0" : ""}`}
    >
      <div className="aspect-4/3 bg-paper-deep">
        {item.imageUrl !== undefined ? (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-display font-bold tracking-tight">
            {item.title}
          </h3>
          <span className="text-ink-soft tabular-nums">
            {formatPrice(item)}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <ReservationBadge reservedBy={item.reservedBy} />
          {item.url !== undefined ? (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              View
              <span className="sr-only"> {item.title} in store</span>
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}
