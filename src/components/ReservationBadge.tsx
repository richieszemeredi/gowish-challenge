import { CURRENT_USER, type WishItem } from "@/api";

export function ReservationBadge({
  reservedBy,
}: {
  reservedBy: WishItem["reservedBy"];
}): React.JSX.Element {
  const label =
    reservedBy === null
      ? "Available"
      : `Reserved by ${reservedBy === CURRENT_USER ? "you" : reservedBy}`;
  const tone =
    reservedBy === null || reservedBy === CURRENT_USER
      ? "bg-mint-soft"
      : "bg-butter-soft";

  return (
    <span
      className={`absolute top-3 right-3 rounded-full px-3 py-1 text-sm font-medium text-ink shadow-soft ${tone}`}
    >
      {label}
    </span>
  );
}
