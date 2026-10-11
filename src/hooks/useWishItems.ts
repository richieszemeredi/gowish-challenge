import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getItems, type WishItem } from "@/api";

const POLL_MS = 10_000;

export const useWishItems = (): UseQueryResult<WishItem[]> =>
  useQuery({
    queryKey: ["items"],
    queryFn: getItems,
    refetchInterval: POLL_MS,
  });
