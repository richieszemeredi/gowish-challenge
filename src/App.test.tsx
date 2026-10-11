import { expect } from "vitest";
import * as api from "@/api";
import { renderApp } from "@/test/renderApp";

vi.mock("@/api");

const item: api.WishItem = {
  id: "1",
  title: "Lamp",
  priceMinor: 100000,
  currency: "DKK",
  reservedBy: null,
};

describe("Wishlist", () => {
  it("shows a skeleton, then the wishlist", async () => {
    let resolve: (items: api.WishItem[]) => void = () => undefined;
    vi.mocked(api.getItems).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const screen = await renderApp();
    await expect
      .element(screen.getByRole("heading", { name: "Wishlist" }))
      .toBeVisible();
    await expect.element(screen.getByLabelText("Loading wishes")).toBeVisible();
    resolve([item]);
    await expect.element(screen.getByText("Lamp")).toBeVisible();
    await expect.element(screen.getByText(/1\.000,00/)).toBeVisible();
  });

  it("shows an empty state when there are no wishes", async () => {
    vi.mocked(api.getItems).mockResolvedValue([]);
    const screen = await renderApp();
    await expect.element(screen.getByText("No wishes yet.")).toBeVisible();
  });

  it("shows an error and recovers on retry", async () => {
    vi.mocked(api.getItems)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce([item]);
    const screen = await renderApp();
    await screen.getByRole("button", { name: "Retry" }).click();
    await expect.element(screen.getByText("Lamp")).toBeVisible();
  });
});
