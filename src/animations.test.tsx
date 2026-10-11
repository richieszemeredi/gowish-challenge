import { expect } from "vitest";
import { commands, page, type Locator } from "vitest/browser";
import * as api from "@/api";
import { finished, keyframesOf, style, transitionsOf } from "@/test/animations";
import { renderApp } from "@/test/renderApp";

vi.mock("@/api");

const lamp: api.WishItem = {
  id: "1",
  title: "Lamp",
  priceMinor: 100000,
  currency: "DKK",
  reservedBy: null,
};
const vase: api.WishItem = { ...lamp, id: "2", title: "Vase" };

type Screen = Awaited<ReturnType<typeof renderApp>>;

const openSheet = async (screen: Screen): Promise<void> => {
  await screen.getByRole("button", { name: "New wish" }).click();
};

const addVase = async (screen: Screen): Promise<void> => {
  await screen.getByLabelText(/^Title/).fill("Vase");
  await screen.getByLabelText(/^Price/).fill("10");
  await screen.getByRole("button", { name: "Save wish" }).click();
};

// The icon is remounted on every status change, so look it up fresh.
const icon = async (screen: Screen, name: string): Promise<Locator> => {
  const selector = `form button svg.lucide-${name}`;
  await expect
    .poll(() => screen.container.querySelector(selector))
    .not.toBeNull();
  return page.elementLocator(screen.container.querySelector(selector)!);
};

describe("List items", () => {
  it("appear instantly on the first load", async () => {
    vi.mocked(api.getItems).mockResolvedValue([lamp, vase]);
    const screen = await renderApp();
    const row = screen.getByRole("listitem").first();
    await expect.element(row).toBeVisible();
    expect(transitionsOf(row, "opacity")).toHaveLength(0);
    expect(style(row, "opacity")).toBe("1");
  });

  it("fade and slide in when added later", async () => {
    vi.mocked(api.getItems)
      .mockResolvedValueOnce([lamp])
      .mockResolvedValue([lamp, vase]);
    vi.mocked(api.addItem).mockResolvedValue(vase);
    const screen = await renderApp();
    await expect.element(screen.getByText("Lamp")).toBeVisible();
    await openSheet(screen);
    await addVase(screen);

    const row = screen.getByRole("listitem").filter({ hasText: "Vase" });
    await expect.element(row).toBeVisible();
    const fade = transitionsOf(row, "opacity");
    const slide = transitionsOf(row, "translate");
    expect(fade).toHaveLength(1);
    expect(slide).toHaveLength(1);
    expect(style(screen.getByText("Lamp"), "opacity")).toBe("1");

    await finished([...fade, ...slide]);
    expect(style(row, "opacity")).toBe("1");
    expect(style(row, "translate")).toBe("none");
  });

  it("first item in an empty list animates in too", async () => {
    vi.mocked(api.getItems).mockResolvedValueOnce([]).mockResolvedValue([vase]);
    vi.mocked(api.addItem).mockResolvedValue(vase);
    const screen = await renderApp();
    await expect.element(screen.getByText("No wishes yet.")).toBeVisible();
    await openSheet(screen);
    await addVase(screen);
    const row = screen.getByRole("listitem");
    await expect.element(row).toBeVisible();
    expect(transitionsOf(row, "opacity")).toHaveLength(1);
  });

  it("don't animate with reduced motion", async () => {
    await commands.setReducedMotion(true);
    vi.mocked(api.getItems)
      .mockResolvedValueOnce([lamp])
      .mockResolvedValue([lamp, vase]);
    vi.mocked(api.addItem).mockResolvedValue(vase);
    const screen = await renderApp();
    await expect.element(screen.getByText("Lamp")).toBeVisible();
    await openSheet(screen);
    await addVase(screen);
    const row = screen.getByRole("listitem").filter({ hasText: "Vase" });
    await expect.element(row).toBeVisible();
    expect(transitionsOf(row, "opacity")).toHaveLength(0);
  });
});

describe("Validation messages", () => {
  it("fade in", async () => {
    vi.mocked(api.getItems).mockResolvedValue([]);
    const screen = await renderApp();
    await openSheet(screen);
    await screen.getByRole("button", { name: "Save wish" }).click();
    const message = screen.getByText("Enter a title");
    await expect.element(message).toBeVisible();
    const fade = transitionsOf(message, "opacity");
    expect(fade).toHaveLength(1);
    await finished(fade);
    expect(style(message, "opacity")).toBe("1");
  });

  it("appear without motion when reduced", async () => {
    await commands.setReducedMotion(true);
    vi.mocked(api.getItems).mockResolvedValue([]);
    const screen = await renderApp();
    await openSheet(screen);
    await screen.getByRole("button", { name: "Save wish" }).click();
    const message = screen.getByText("Enter a title");
    await expect.element(message).toBeVisible();
    expect(transitionsOf(message, "opacity")).toHaveLength(0);
  });
});

describe("Add button icon", () => {
  it("spins while saving, without transitions", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    vi.mocked(api.getItems).mockResolvedValue([]);
    vi.mocked(api.addItem).mockReturnValue(new Promise(() => undefined));
    const screen = await renderApp();

    await openSheet(screen);
    await addVase(screen);
    await vi.advanceTimersByTimeAsync(50);

    const spinner = await icon(screen, "loader-circle");
    expect(transitionsOf(spinner, "opacity")).toHaveLength(0);
    expect(keyframesOf(spinner).map((a) => a.animationName)).toContain("spin");
  });
});

describe("Success toast", () => {
  it("fades in, then fades out and is hidden from assistive tech", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    vi.mocked(api.getItems).mockResolvedValue([]);
    vi.mocked(api.addItem).mockResolvedValue(vase);
    const screen = await renderApp();
    await openSheet(screen);
    await addVase(screen);
    await vi.advanceTimersByTimeAsync(50);

    const message = screen.getByText("Wish added");
    await expect.element(message).toBeVisible();
    const fadeIn = transitionsOf(message, "opacity");
    expect(fadeIn).toHaveLength(1);
    await finished(fadeIn);
    expect(style(message, "opacity")).toBe("1");
    expect(message.element()).not.toHaveAttribute("aria-hidden");

    await vi.advanceTimersByTimeAsync(3100);
    await expect.poll(() => transitionsOf(message, "opacity")).toHaveLength(1);
    await finished(transitionsOf(message, "opacity"));
    expect(style(message, "opacity")).toBe("0");
    expect(message.element()).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Success toast without motion", () => {
  it("appears instantly when reduced", async () => {
    await commands.setReducedMotion(true);
    vi.mocked(api.getItems).mockResolvedValue([]);
    vi.mocked(api.addItem).mockResolvedValue(vase);
    const screen = await renderApp();
    await openSheet(screen);
    await addVase(screen);
    const message = screen.getByText("Wish added");
    await expect.element(message).toBeVisible();
    expect(transitionsOf(message, "opacity")).toHaveLength(0);
  });
});
