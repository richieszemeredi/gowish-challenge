import { useState } from "react";
import { useWishItems } from "@/hooks/useWishItems";
import { applyView, DEFAULT_VIEW } from "@/lib/wishView";
import { withViewTransition } from "@/lib/withViewTransition";
import { ListControls } from "./ListControls";
import { WishItems } from "./WishItems";
import { WishListSkeleton } from "./WishListSkeleton";

export function WishList(): React.JSX.Element {
  const { data, isPending, refetch } = useWishItems();
  // The controls update at once; the list follows inside a view transition.
  const [view, setView] = useState(DEFAULT_VIEW);
  const [listView, setListView] = useState(DEFAULT_VIEW);

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

  const visible = applyView(data, listView);

  return (
    <div className="flex flex-col gap-5">
      {data.length > 0 && (
        <ListControls
          view={view}
          onChange={(next) => {
            setView(next);
            withViewTransition(() => {
              setListView(next);
            });
          }}
        />
      )}
      <WishItems
        items={visible}
        emptyText={data.length > 0 ? "No available wishes." : "No wishes yet."}
      />
      <p aria-live="polite" className="sr-only">
        {data.length > 0 &&
          `${String(visible.length)} of ${String(data.length)} wishes shown`}
      </p>
    </div>
  );
}
