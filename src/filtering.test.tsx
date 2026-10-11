import { expect } from "vitest";
import * as api from "@/api";
import { renderApp } from "@/test/renderApp";

vi.mock("@/api");

const wish = (
  id: string,
  title: string,
  priceMinor: number,
  reservedBy: string | null = null,
): api.WishItem => ({ id, title, priceMinor, currency: "DKK", reservedBy });

const wishes = [
  wish("1", "Lamp", 30000),
  wish("2", "Vase", 10000, "mette"),
  wish("3", "Rug", 20000, api.CURRENT_USER),
  wish("4", "Mug", 5000),
];

type Screen = Awaited<ReturnType<typeof renderApp>>;

const titles = (screen: Screen): string[] =>
  screen
    .getByRole("heading", { level: 3 })
    .elements()
    .map((el) => el.textContent);

describe("Filtering and sorting", () => {
  beforeEach(() => {
    vi.mocked(api.getItems).mockResolvedValue(wishes);
  });

  it("lists wishes in the recommended order by default", async () => {
    const screen = await renderApp();
    await expect.element(screen.getByText("Lamp")).toBeVisible();
    expect(titles(screen)).toEqual(["Lamp", "Vase", "Rug", "Mug"]);
    await expect
      .element(screen.getByLabelText("Sort by"))
      .toHaveDisplayValue("Recommended");
    await expect
      .element(screen.getByRole("checkbox", { name: "Available only" }))
      .not.toBeChecked();
  });

  it("sorts by price in both directions and back", async () => {
    const screen = await renderApp();
    const sort = screen.getByLabelText("Sort by");
    await sort.selectOptions("price-asc");
    await expect
      .poll(() => titles(screen))
      .toEqual(["Mug", "Vase", "Rug", "Lamp"]);
    await sort.selectOptions("price-desc");
    await expect
      .poll(() => titles(screen))
      .toEqual(["Lamp", "Rug", "Vase", "Mug"]);
    await sort.selectOptions("recommended");
    await expect
      .poll(() => titles(screen))
      .toEqual(["Lamp", "Vase", "Rug", "Mug"]);
  });

  it("shows only available wishes, hiding those reserved by anyone", async () => {
    const screen = await renderApp();
    await screen.getByRole("checkbox", { name: "Available only" }).click();
    await expect.poll(() => titles(screen)).toEqual(["Lamp", "Mug"]);
    await expect
      .element(screen.getByText(/wishes shown/))
      .toHaveTextContent("2 of 4 wishes shown");
  });

  it("combines the filter with sorting", async () => {
    const screen = await renderApp();
    await screen.getByRole("checkbox", { name: "Available only" }).click();
    await screen.getByLabelText("Sort by").selectOptions("price-asc");
    await expect.poll(() => titles(screen)).toEqual(["Mug", "Lamp"]);
  });

  it("hides a wish once you reserve it under the filter", async () => {
    let mug = wish("4", "Mug", 5000);
    vi.mocked(api.getItems).mockImplementation(async () =>
      Promise.resolve([wishes[0]!, mug]),
    );
    vi.mocked(api.reserveItem).mockImplementation(async () => {
      mug = { ...mug, reservedBy: api.CURRENT_USER };
      return Promise.resolve(mug);
    });
    const screen = await renderApp();
    await screen.getByRole("checkbox", { name: "Available only" }).click();
    await screen.getByRole("button", { name: /^Reserve Mug/ }).click();
    await expect.poll(() => titles(screen)).toEqual(["Lamp"]);
    await expect.element(screen.getByText("Reserved Mug.")).toBeVisible();
  });

  it("explains an empty result and recovers when the filter is cleared", async () => {
    vi.mocked(api.getItems).mockResolvedValue([
      wish("2", "Vase", 10000, "mette"),
    ]);
    const screen = await renderApp();
    await screen.getByRole("checkbox", { name: "Available only" }).click();
    await expect
      .element(screen.getByText("No available wishes."))
      .toBeVisible();
    await screen.getByRole("checkbox", { name: "Available only" }).click();
    await expect.element(screen.getByText("Vase")).toBeVisible();
  });

  it("offers no controls when the list is empty", async () => {
    vi.mocked(api.getItems).mockResolvedValue([]);
    const screen = await renderApp();
    await expect.element(screen.getByText("No wishes yet.")).toBeVisible();
    await expect
      .element(screen.getByLabelText("Sort by"))
      .not.toBeInTheDocument();
  });
});
