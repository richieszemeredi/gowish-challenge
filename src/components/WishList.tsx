import { useWishItems } from "@/hooks/useWishItems";
import { WishItems } from "./WishItems";
import { WishListSkeleton } from "./WishListSkeleton";

export function WishList(): React.JSX.Element {
  const { data, isPending, refetch } = useWishItems();

  if (isPending) return <WishListSkeleton />;

  if (!data)
    return (
      <div role="alert" className="flex items-center justify-between gap-4">
        <p>Couldn&rsquo;t load the wishlist.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-full bg-coral-soft px-4 py-1.5 font-medium"
        >
          Retry
        </button>
      </div>
    );

  return <WishItems items={data} />;
}
