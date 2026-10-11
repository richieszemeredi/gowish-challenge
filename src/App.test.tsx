import { expect } from "vitest";
import { commands, page } from "vitest/browser";
import * as api from "@/api";
import { finished, style, transitionsOf } from "@/test/animations";
import { renderApp } from "@/test/renderApp";

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<typeof api>();
  return {
    ...vi.mockObject(actual),
    ConflictError: actual.ConflictError,
    NotFoundError: actual.NotFoundError,
  };
});

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
      .element(screen.getByRole("heading", { name: /^Lamp/ }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: /^Lamp/ }))
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
    await screen.getByLabelText(/^Title/).fill(title);
    await screen.getByLabelText(/^Price/).fill(price);
    if (url !== "") await screen.getByLabelText(/Link/).fill(url);
  };

  it("validates the fields", async () => {
    vi.mocked(api.getItems).mockResolvedValue([]);
    const screen = await renderApp();
    await open(screen);
    await screen.getByRole("button", { name: "Save wish" }).click();
    await expect.element(screen.getByText("Enter a title")).toBeVisible();
    await expect.element(screen.getByText("Enter a price")).toBeVisible();

    await fill(screen, "Lamp", "-5", "nope");
    await screen.getByRole("button", { name: "Save wish" }).click();
    await expect
      .element(screen.getByText("Price can't be negative"))
      .toBeVisible();
    await expect.element(screen.getByText(/Enter a valid link/)).toBeVisible();
    await expect.element(screen.getByLabelText(/^Title/)).toHaveValue("Lamp");
    expect(api.addItem).not.toHaveBeenCalled();
  });

  it("adds an item in minor units and clears the form", async () => {
    vi.mocked(api.getItems).mockResolvedValue([]);
    vi.mocked(api.addItem).mockResolvedValue({ ...item, title: "Lamp" });
    const screen = await renderApp();
    await open(screen);
    await fill(screen, "  Lamp ", "12,50", "https://example.com");
    await screen.getByRole("button", { name: "Save wish" }).click();
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
    await expect.element(screen.getByLabelText(/^Title/)).toHaveValue("");
  });

  it("omits an empty link", async () => {
    vi.mocked(api.getItems).mockResolvedValue([]);
    vi.mocked(api.addItem).mockResolvedValue(item);
    const screen = await renderApp();
    await open(screen);
    await fill(screen, "Lamp", "10");
    await screen.getByRole("button", { name: "Save wish" }).click();
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
    await screen.getByRole("button", { name: "Save wish" }).click();
    await expect
      .element(screen.getByText("Couldn’t add the wish."))
      .toBeVisible();
    await expect.element(screen.getByLabelText(/^Title/)).toHaveValue("Lamp");
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

describe("List controls", () => {
  it("stay visible below the sticky header while scrolling", async () => {
    await page.viewport(390, 600);
    vi.mocked(api.getItems).mockResolvedValue(
      Array.from({ length: 12 }, (_, i) => ({ ...item, id: String(i) })),
    );
    const screen = await renderApp();
    await expect.element(screen.getByText("Lamp").first()).toBeVisible();
    const sort = screen.getByLabelText("Sort by").element();
    const bar = screen.getByText("Wishlist").last().element();
    screen.getByRole("listitem").nth(8).element().scrollIntoView();
    await expect.poll(() => window.scrollY).toBeGreaterThan(0);
    await expect
      .poll(() => sort.getBoundingClientRect().top)
      .toBeGreaterThanOrEqual(bar.getBoundingClientRect().bottom);
    expect(sort.getBoundingClientRect().bottom).toBeLessThan(200);
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

describe("Reserving", () => {
  const reserve = (
    screen: Awaited<ReturnType<typeof renderApp>>,
  ): ReturnType<typeof screen.getByRole> =>
    screen.getByRole("button", { name: /^Reserve/ });

  const later = async <T,>(read: () => T): Promise<T> => {
    await Promise.resolve();
    return read();
  };

  // A tiny server: the list always reflects what reserve/unreserve did.
  const serve = (...initial: api.WishItem[]): void => {
    let state = initial;
    const set = (id: string, reservedBy: string | null): api.WishItem => {
      state = state.map((i) => (i.id === id ? { ...i, reservedBy } : i));
      return state.find((i) => i.id === id) ?? item;
    };
    vi.mocked(api.getItems).mockImplementation(async () => later(() => state));
    vi.mocked(api.reserveItem).mockImplementation(async (id) =>
      later(() => set(id, api.CURRENT_USER)),
    );
    vi.mocked(api.unreserveItem).mockImplementation(async (id) =>
      later(() => set(id, null)),
    );
  };

  it("reserves and unreserves once the server answers", async () => {
    serve(item);
    const screen = await renderApp();
    await reserve(screen).click();
    await expect.element(screen.getByText("Reserved by you")).toBeVisible();
    await expect.element(screen.getByText("Reserved Lamp.")).toBeVisible();
    expect(api.reserveItem).toHaveBeenCalledWith("1");
    await screen.getByRole("button", { name: /^Unreserve/ }).click();
    await expect.element(screen.getByText("Available")).toBeVisible();
    await expect.element(screen.getByText("Unreserved Lamp.")).toBeVisible();
  });

  it("keeps the card unchanged while the request is pending", async () => {
    serve(item);
    vi.mocked(api.reserveItem).mockReturnValue(new Promise(() => undefined));
    const screen = await renderApp();
    await reserve(screen).click();
    await expect
      .element(screen.getByRole("button", { name: "Reserving Lamp" }))
      .toBeDisabled();
    await expect.element(screen.getByText("Available")).toBeVisible();
    expect(screen.getByText("Reserved by you").query()).toBeNull();
  });

  it("only blocks the pending item", async () => {
    serve(item, { ...item, id: "2", title: "Vase" });
    vi.mocked(api.reserveItem).mockReturnValue(new Promise(() => undefined));
    const screen = await renderApp();
    await screen.getByRole("button", { name: "Reserve Lamp" }).click();
    await expect
      .element(screen.getByRole("button", { name: "Reserving Lamp" }))
      .toBeDisabled();
    await expect
      .element(screen.getByRole("button", { name: "Reserve Vase" }))
      .toBeEnabled();
  });

  it("disables reserving items held by others", async () => {
    serve({ ...item, reservedBy: "mette" });
    const screen = await renderApp();
    await expect.element(screen.getByText("Reserved by mette")).toBeVisible();
    await expect.element(reserve(screen)).toBeDisabled();
  });

  it("shows the server's truth on a conflict", async () => {
    const taken = { ...item, reservedBy: "mette" };
    serve(item);
    vi.mocked(api.reserveItem).mockImplementation(async () => {
      vi.mocked(api.getItems).mockResolvedValue([taken]);
      await Promise.resolve();
      throw new api.ConflictError(taken);
    });
    const screen = await renderApp();
    await reserve(screen).click();
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("mette already reserved Lamp.");
    await expect.element(screen.getByText("Reserved by mette")).toBeVisible();
  });

  it("stays unchanged on a network error and retries", async () => {
    serve(item);
    const ok = vi.mocked(api.reserveItem).getMockImplementation();
    vi.mocked(api.reserveItem)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockImplementation(ok ?? (async () => later(() => item)));
    const screen = await renderApp();
    await reserve(screen).click();
    await expect
      .element(screen.getByText(/Couldn’t reserve Lamp/))
      .toBeVisible();
    await expect.element(screen.getByText("Available")).toBeVisible();
    await screen.getByRole("button", { name: "Retry" }).click();
    await expect.element(screen.getByText("Reserved by you")).toBeVisible();
  });
});

describe("Toast list", () => {
  it("keeps earlier toasts visible when more arrive", async () => {
    vi.mocked(api.getItems).mockResolvedValue([
      item,
      { ...item, id: "2", title: "Vase" },
    ]);
    vi.mocked(api.reserveItem).mockImplementation(async (id) => {
      await Promise.resolve();
      return { ...item, id, reservedBy: api.CURRENT_USER };
    });
    const screen = await renderApp();
    await screen.getByRole("button", { name: "Reserve Lamp" }).click();
    await screen.getByRole("button", { name: "Reserve Vase" }).click();
    await expect.element(screen.getByText("Reserved Lamp.")).toBeVisible();
    await expect.element(screen.getByText("Reserved Vase.")).toBeVisible();
  });
});
