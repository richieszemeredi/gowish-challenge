import { useState } from "react";
import type { WishItem } from "@/api";
import { WishItemRow } from "./WishItemRow";

// Mounted once the list has loaded: rows present at that point appear
// instantly, rows that arrive later animate in.
export function WishItems({ items }: { items: WishItem[] }): React.JSX.Element {
  const [initialIds] = useState(() => new Set(items.map((i) => i.id)));

  if (items.length === 0)
    return <p className="text-ink-soft">No wishes yet.</p>;

  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <WishItemRow
          key={item.id}
          item={item}
          animate={!initialIds.has(item.id)}
        />
      ))}
    </ul>
  );
}
