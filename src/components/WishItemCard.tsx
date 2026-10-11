import { ExternalLink, Gift } from "lucide-react";
import type { WishItem } from "@/api";
import { ReservationAction } from "./ReservationAction";
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
      style={{ viewTransitionName: `wish-${item.id}` }}
      className={`flex flex-col overflow-hidden rounded-card border border-line bg-card ${animate ? "motion-safe:transition motion-safe:duration-300 motion-safe:starting:-translate-y-2 motion-safe:starting:opacity-0" : ""}`}
    >
      <div className="relative grid aspect-4/3 place-items-center bg-sky-soft text-ink-soft">
        {item.imageUrl !== undefined ? (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <Gift aria-hidden="true" className="size-10" />
        )}
        <ReservationBadge reservedBy={item.reservedBy} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-display font-bold tracking-tight">
            {item.url !== undefined ? (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                {item.title}
                <ExternalLink
                  aria-hidden="true"
                  className="ml-1.5 inline size-4 align-[-0.125em]"
                />
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            ) : (
              item.title
            )}
          </h3>
          <span className="text-ink-soft tabular-nums">
            {formatPrice(item)}
          </span>
        </div>
        <div className="mt-auto">
          <ReservationAction item={item} />
        </div>
      </div>
    </li>
  );
}
