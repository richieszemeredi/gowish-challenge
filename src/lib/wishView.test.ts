import type { WishItem } from "@/api";
import { applyView } from "./wishView";

const wish = (
  id: string,
  priceMinor: number,
  reservedBy: string | null,
): WishItem => ({
  id,
  title: id,
  priceMinor,
  currency: "DKK",
  reservedBy,
});

const items = [
  wish("a", 300, null),
  wish("b", 100, "mette"),
  wish("c", 300, "you"),
  wish("d", 200, null),
];
const ids = (list: WishItem[]): string => list.map((i) => i.id).join("");

describe("applyView", () => {
  it("keeps the list order when recommended", () => {
    expect(
      ids(applyView(items, { availableOnly: false, sort: "recommended" })),
    ).toBe("abcd");
  });

  it("sorts by price, keeping the list order for equal prices", () => {
    expect(
      ids(applyView(items, { availableOnly: false, sort: "price-asc" })),
    ).toBe("bdac");
    expect(
      ids(applyView(items, { availableOnly: false, sort: "price-desc" })),
    ).toBe("acdb");
  });

  it("only keeps unreserved items when filtering", () => {
    expect(
      ids(applyView(items, { availableOnly: true, sort: "price-asc" })),
    ).toBe("da");
  });
});
