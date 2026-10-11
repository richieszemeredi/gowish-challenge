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

describe("Adding an item", () => {
  const fill = async (
    screen: Awaited<ReturnType<typeof renderApp>>,
    title: string,
    price: string,
    url = "",
  ): Promise<void> => {
    await screen.getByLabelText("Title").fill(title);
    await screen.getByLabelText("Price (DKK)").fill(price);
    if (url !== "") await screen.getByLabelText(/Link/).fill(url);
  };

  it("validates the fields", async () => {
    vi.mocked(api.getItems).mockResolvedValue([]);
    const screen = await renderApp();
    await screen.getByRole("button", { name: "Add wish" }).click();
    await expect.element(screen.getByText("Enter a title")).toBeVisible();
    await expect.element(screen.getByText("Enter a price")).toBeVisible();

    await fill(screen, "Lamp", "-5", "nope");
    await screen.getByRole("button", { name: "Add wish" }).click();
    await expect
      .element(screen.getByText("Price can't be negative"))
      .toBeVisible();
    await expect.element(screen.getByText(/Enter a valid link/)).toBeVisible();
    await expect.element(screen.getByLabelText("Title")).toHaveValue("Lamp");
    expect(api.addItem).not.toHaveBeenCalled();
  });

  it("adds an item in minor units and clears the form", async () => {
    vi.mocked(api.getItems).mockResolvedValue([]);
    vi.mocked(api.addItem).mockResolvedValue({ ...item, title: "Lamp" });
    const screen = await renderApp();
    await fill(screen, "  Lamp ", "12,50", "https://example.com");
    await screen.getByRole("button", { name: "Add wish" }).click();
    await expect.element(screen.getByText("Wish added.")).toBeVisible();
    expect(api.addItem).toHaveBeenCalledWith({
      title: "Lamp",
      priceMinor: 1250,
      url: "https://example.com",
    });
    await expect.element(screen.getByLabelText("Title")).toHaveValue("");
  });

  it("omits an empty link", async () => {
    vi.mocked(api.getItems).mockResolvedValue([]);
    vi.mocked(api.addItem).mockResolvedValue(item);
    const screen = await renderApp();
    await fill(screen, "Lamp", "10");
    await screen.getByRole("button", { name: "Add wish" }).click();
    await expect.element(screen.getByText("Wish added.")).toBeVisible();
    expect(api.addItem).toHaveBeenCalledWith({
      title: "Lamp",
      priceMinor: 1000,
    });
  });

  it("keeps the input on a network error and succeeds on retry", async () => {
    vi.mocked(api.getItems).mockResolvedValue([]);
    vi.mocked(api.addItem)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(item);
    const screen = await renderApp();
    await fill(screen, "Lamp", "10");
    await screen.getByRole("button", { name: "Add wish" }).click();
    await expect
      .element(screen.getByText("Couldn’t add the wish."))
      .toBeVisible();
    await expect.element(screen.getByLabelText("Title")).toHaveValue("Lamp");
    await screen.getByRole("button", { name: "Retry" }).click();
    await expect.element(screen.getByText("Wish added.")).toBeVisible();
  });
});
