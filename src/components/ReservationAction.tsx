import { Bookmark, BookmarkX } from "lucide-react";
import { CURRENT_USER, type WishItem } from "@/api";
import { useReservation } from "@/hooks/useReservation";
import { Button } from "./Button";

export function ReservationAction({
  item,
}: {
  item: WishItem;
}): React.JSX.Element {
  const { mutate, isPending, variables } = useReservation(item);
  const mine = item.reservedBy === CURRENT_USER;

  const verb = isPending
    ? variables === "reserve"
      ? "Reserving"
      : "Unreserving"
    : mine
      ? "Unreserve"
      : "Reserve";
  const taken = item.reservedBy !== null && !mine;

  return (
    <Button
      icon={mine ? BookmarkX : Bookmark}
      label={`${verb} ${item.title}`}
      wide
      disabled={isPending || taken}
      status={isPending ? "loading" : "idle"}
      onClick={() => {
        mutate(mine ? "unreserve" : "reserve");
      }}
    >
      {verb}
      {isPending ? "…" : ""}
    </Button>
  );
}
