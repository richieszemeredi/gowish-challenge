import { expect } from "vitest";
import { commands, page } from "vitest/browser";
import * as api from "@/api";
import { finished, style, transitionsOf } from "@/test/animations";
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

  it("shows each wish as a card with image, link and reservation", async () => {
    vi.mocked(api.getItems).mockResolvedValue([
      {
        ...item,
        imageUrl: "/lamp.png",
        url: "https://example.com/lamp",
        reservedBy: "mette",
      },
      { ...item, id: "2", title: "Vase", reservedBy: api.CURRENT_USER },
      { ...item, id: "3", title: "Rug" },
    ]);
    const screen = await renderApp();
    await expect
      .element(screen.getByRole("heading", { name: "Lamp" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: /Lamp in store/ }))
      .toHaveAttribute("href", "https://example.com/lamp");
    await expect.element(screen.getByText("Reserved by mette")).toBeVisible();
    await expect.element(screen.getByText("Reserved by you")).toBeVisible();
    await expect.element(screen.getByText("Available")).toBeVisible();
    expect(screen.container.querySelector("img")?.getAttribute("src")).toBe(
      "/lamp.png",
    );
    expect(screen.container.querySelectorAll("svg.lucide-gift")).toHaveLength(
      2,
    );
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
  const open = async (
    screen: Awaited<ReturnType<typeof renderApp>>,
  ): Promise<void> => {
    await screen.getByRole("button", { name: "New wish" }).click();
  };

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
    await open(screen);
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
    await open(screen);
    await fill(screen, "  Lamp ", "12,50", "https://example.com");
    await screen.getByRole("button", { name: "Add wish" }).click();
    await expect.element(screen.getByText("Wish added")).toBeVisible();
    await expect
      .element(screen.getByRole("dialog", { name: "New wish" }))
      .not.toBeInTheDocument();
    expect(api.addItem).toHaveBeenCalledWith({
      title: "Lamp",
      priceMinor: 1250,
      url: "https://example.com",
    });
    await screen.getByRole("button", { name: "New wish" }).click();
    await expect.element(screen.getByLabelText("Title")).toHaveValue("");
  });

  it("omits an empty link", async () => {
    vi.mocked(api.getItems).mockResolvedValue([]);
    vi.mocked(api.addItem).mockResolvedValue(item);
    const screen = await renderApp();
    await open(screen);
    await fill(screen, "Lamp", "10");
    await screen.getByRole("button", { name: "Add wish" }).click();
    await expect.element(screen.getByText("Wish added")).toBeVisible();
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
    await open(screen);
    await fill(screen, "Lamp", "10");
    await screen.getByRole("button", { name: "Add wish" }).click();
    await expect
      .element(screen.getByText("Couldn’t add the wish."))
      .toBeVisible();
    await expect.element(screen.getByLabelText("Title")).toHaveValue("Lamp");
    await expect
      .element(screen.getByRole("dialog", { name: "New wish" }))
      .toBeVisible();
    await screen.getByRole("button", { name: "Retry" }).click();
    await expect.element(screen.getByText("Wish added")).toBeVisible();
  });
});

describe("New wish sheet", () => {
  it("is closed until the button is used and can be dismissed", async () => {
    vi.mocked(api.getItems).mockResolvedValue([]);
    const screen = await renderApp();
    await expect
      .element(screen.getByRole("dialog", { name: "New wish" }))
      .not.toBeInTheDocument();
    await screen.getByRole("button", { name: "New wish" }).click();
    await expect
      .element(screen.getByRole("dialog", { name: "New wish" }))
      .toBeVisible();
    await screen.getByRole("button", { name: "Close" }).click();
    await expect
      .element(screen.getByRole("dialog", { name: "New wish" }))
      .not.toBeInTheDocument();
  });
});

describe("Grid columns", () => {
  const columns = (list: Element): number =>
    getComputedStyle(list).gridTemplateColumns.split(" ").length;

  it.each([
    ["mobile", 390, 1],
    ["tablet", 800, 2],
    ["desktop", 1280, 3],
  ])("uses %s layout at %ipx", async (_name, width, expected) => {
    await page.viewport(width, 900);
    vi.mocked(api.getItems).mockResolvedValue(
      ["1", "2", "3"].map((id) => ({ ...item, id })),
    );
    const screen = await renderApp();
    const list = screen.getByRole("list");
    await expect.element(list).toBeVisible();
    expect(columns(list.element())).toBe(expected);
  });
});

describe("Sticky header", () => {
  it("fades in once the header has scrolled away, and out again", async () => {
    await page.viewport(390, 600);
    vi.mocked(api.getItems).mockResolvedValue(
      Array.from({ length: 12 }, (_, i) => ({ ...item, id: String(i) })),
    );
    const screen = await renderApp();
    await expect.element(screen.getByText("Lamp").first()).toBeVisible();
    const bar = screen.getByText("Wishlist").last();
    expect(transitionsOf(bar, "opacity")).toHaveLength(0);
    expect(style(bar, "opacity")).toBe("0");

    window.scrollTo(0, document.body.scrollHeight);
    await expect.poll(() => transitionsOf(bar, "opacity")).toHaveLength(1);
    await finished(transitionsOf(bar, "opacity"));
    expect(style(bar, "opacity")).toBe("1");

    window.scrollTo(0, 0);
    await expect.poll(() => transitionsOf(bar, "opacity")).toHaveLength(1);
    await finished(transitionsOf(bar, "opacity"));
    expect(style(bar, "opacity")).toBe("0");
  });

  it("appears without a transition when motion is reduced", async () => {
    await commands.setReducedMotion(true);
    await page.viewport(390, 600);
    vi.mocked(api.getItems).mockResolvedValue(
      Array.from({ length: 12 }, (_, i) => ({ ...item, id: String(i) })),
    );
    const screen = await renderApp();
    await expect.element(screen.getByText("Lamp").first()).toBeVisible();
    const bar = screen.getByText("Wishlist").last();
    window.scrollTo(0, document.body.scrollHeight);
    await expect.poll(() => style(bar, "opacity")).toBe("1");
    expect(transitionsOf(bar, "opacity")).toHaveLength(0);
  });
});

describe("Floating button", () => {
  it("never covers the last wish at the bottom of the page", async () => {
    await page.viewport(390, 600);
    vi.mocked(api.getItems).mockResolvedValue(
      Array.from({ length: 12 }, (_, i) => ({ ...item, id: String(i) })),
    );
    const screen = await renderApp();
    await expect.element(screen.getByText("Lamp").first()).toBeVisible();
    window.scrollTo(0, document.body.scrollHeight);
    const last = screen.getByRole("listitem").last().element();
    const fab = screen.getByRole("button", { name: "New wish" }).element();
    await expect
      .poll(
        () =>
          last.getBoundingClientRect().bottom <=
          fab.getBoundingClientRect().top,
      )
      .toBe(true);
  });
});

describe("Loading skeleton", () => {
  it("is as tall as a loaded card, so nothing jumps", async () => {
    let resolve: (items: api.WishItem[]) => void = () => undefined;
    vi.mocked(api.getItems).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const screen = await renderApp();
    const placeholder = screen.getByRole("listitem").first();
    await expect.element(placeholder).toBeVisible();
    const before = placeholder.element().getBoundingClientRect().height;
    resolve([item]);
    const card = screen.getByRole("listitem").first();
    await expect.element(card.getByText("Lamp")).toBeVisible();
    expect(card.element().getBoundingClientRect().height).toBe(before);
  });
});
