import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("App", () => {
  it("shows a skeleton, then the wishlist", async () => {
    vi.mocked(api.getItems).mockResolvedValue([item]);
    renderApp();
    expect(
      screen.getByRole("heading", { name: "Wishlist" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Loading wishes")).toBeInTheDocument();
    expect(await screen.findByText("Lamp")).toBeInTheDocument();
    expect(screen.getByText(/1\.000,00/)).toBeInTheDocument();
  });

  it("shows an empty state when there are no wishes", async () => {
    vi.mocked(api.getItems).mockResolvedValue([]);
    renderApp();
    expect(await screen.findByText("No wishes yet.")).toBeInTheDocument();
  });

  it("shows an error and recovers on retry", async () => {
    vi.mocked(api.getItems)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce([item]);
    renderApp();
    await userEvent.click(await screen.findByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Lamp")).toBeInTheDocument();
  });
});
