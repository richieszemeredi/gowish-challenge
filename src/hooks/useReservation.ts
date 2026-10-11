import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  ConflictError,
  CURRENT_USER,
  reserveItem,
  unreserveItem,
  type WishItem,
} from "@/api";

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

// One mutation per card, so a pending item never blocks the others.
export const useReservation = (
  id: string,
): UseMutationResult<
  WishItem,
  Error,
  ReservationAction,
  { previous: WishItem | undefined }
> => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (action) =>
      action === "reserve" ? reserveItem(id) : unreserveItem(id),
    onMutate: async (action) => {
      await client.cancelQueries({ queryKey: KEY });
      const previous = client
        .getQueryData<WishItem[]>(KEY)
        ?.find((i) => i.id === id);
      patchItem(client, id, {
        reservedBy: action === "reserve" ? CURRENT_USER : null,
      });
      return { previous };
    },
    onError: (error, _action, context) => {
      const truth =
        error instanceof ConflictError ? error.item : context?.previous;
      if (truth) patchItem(client, id, truth);
    },
    onSettled: async () => client.invalidateQueries({ queryKey: KEY }),
  });
};
