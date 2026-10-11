import { useWishItems } from "@/hooks/useWishItems";
import { WishItemRow } from "./WishItemRow";
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

  return (
    <ul className="divide-y divide-line">
      {data.map((item) => (
        <WishItemRow key={item.id} item={item} />
      ))}
    </ul>
  );
}
