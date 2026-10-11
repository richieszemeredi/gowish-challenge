import { Bookmark, BookmarkX } from "lucide-react";
import { ConflictError, CURRENT_USER, type WishItem } from "@/api";
import {
  useReservation,
  type ReservationAction as Action,
} from "@/hooks/useReservation";
import { useToast } from "@/hooks/useToast";
import { Button } from "./Button";

export function ReservationAction({
  item,
}: {
  item: WishItem;
}): React.JSX.Element {
  const { mutate, isPending, variables } = useReservation(item.id);
  const notify = useToast();
  const mine = item.reservedBy === CURRENT_USER;

  const verb = isPending
    ? variables === "reserve"
      ? "Reserving"
      : "Unreserving"
    : mine
      ? "Unreserve"
      : "Reserve";
  const taken = item.reservedBy !== null && !mine;

  const run = (action: Action): void => {
    const reserving = action === "reserve";
    mutate(action, {
      onSuccess: () => {
        notify(`${reserving ? "Reserved" : "Unreserved"} ${item.title}.`);
      },
      onError: (error) => {
        if (error instanceof ConflictError)
          notify(
            reserving
              ? `${error.item.reservedBy ?? "Someone"} already reserved ${item.title}.`
              : `You no longer hold ${item.title}.`,
          );
        else
          notify(`Couldn’t ${action} ${item.title}.`, () => {
            run(action);
          });
      },
    });
  };

  return (
    <Button
      icon={mine ? BookmarkX : Bookmark}
      label={`${verb} ${item.title}`}
      wide
      disabled={isPending || taken}
      status={isPending ? "loading" : "idle"}
      onClick={() => {
        run(mine ? "unreserve" : "reserve");
      }}
    >
      {verb}
      {isPending ? "…" : ""}
    </Button>
  );
}
