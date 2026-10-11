import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  ConflictError,
  reserveItem,
  unreserveItem,
  type WishItem,
} from "@/api";
import { useToast } from "./useToast";

export type ReservationAction = "reserve" | "unreserve";

const KEY = ["items"];

const patchItem = (
  client: QueryClient,
  id: string,
  patch: Partial<WishItem>,
): void => {
  client.setQueryData<WishItem[]>(KEY, (items) =>
    items?.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  );
};

// Pessimistic: one mutation per card, so a pending item never blocks the others.
// Toasts live in the hook-level callbacks: unlike the ones passed to `mutate`,
// they still fire when the card unmounts because the list filter dropped it.
export const useReservation = (
  item: WishItem,
): UseMutationResult<WishItem, Error, ReservationAction> => {
  const client = useQueryClient();
  const notify = useToast();
  const mutation = useMutation<WishItem, Error, ReservationAction>({
    mutationFn: async (action) =>
      action === "reserve" ? reserveItem(item.id) : unreserveItem(item.id),
    // The card only changes once the server has answered.
    onSuccess: (updated, action) => {
      patchItem(client, item.id, updated);
      notify(
        `${action === "reserve" ? "Reserved" : "Unreserved"} ${item.title}.`,
      );
    },
    onError: (error, action) => {
      if (error instanceof ConflictError) {
        patchItem(client, item.id, error.item);
        notify(
          action === "reserve"
            ? `${error.item.reservedBy ?? "Someone"} already reserved ${item.title}.`
            : `You no longer hold ${item.title}.`,
        );
      } else
        notify(`Couldn’t ${action} ${item.title}.`, () => {
          mutation.mutate(action);
        });
    },
    // Not returned: awaiting the refetch would keep the mutation pending (and
    // the button disabled) for the whole round trip after the answer arrived.
    onSettled: () => {
      void client.invalidateQueries({ queryKey: KEY });
    },
  });
  return mutation;
};
