import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { addItem, type WishItem } from "@/api";

type NewItem = Parameters<typeof addItem>[0];

export const useAddItem = (): UseMutationResult<WishItem, Error, NewItem> => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input) => addItem(input),
    onSettled: async () => client.invalidateQueries({ queryKey: ["items"] }),
  });
};
