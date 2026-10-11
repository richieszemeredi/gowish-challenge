import { useId } from "react";
import type { SortOrder, WishView } from "@/lib/wishView";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function ListControls({
  view,
  onChange,
}: {
  view: WishView;
  onChange: (view: WishView) => void;
}): React.JSX.Element {
  const sortId = useId();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-mint-soft px-4 py-1.5 font-medium has-checked:bg-mint">
        <input
          type="checkbox"
          checked={view.availableOnly}
          onChange={(e) => {
            onChange({ ...view, availableOnly: e.target.checked });
          }}
          className="size-4 accent-ink"
        />
        Available only
      </label>
      <div className="inline-flex items-center gap-2">
        <label htmlFor={sortId} className="text-ink-soft">
          Sort by
        </label>
        <select
          id={sortId}
          value={view.sort}
          onChange={(e) => {
            onChange({ ...view, sort: e.target.value as SortOrder });
          }}
          className="rounded-full border border-line bg-card px-3 py-1.5 text-ink"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
