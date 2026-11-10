import { render, screen } from "@testing-library/react";

import ColorPalette from "./ColorPalette";

const colors = ["#37412E", "#8D7332", "#838665"];

test("shows a Colors heading", () => {
  render(<ColorPalette colors={colors} />);

  expect(screen.getByRole("heading", { name: "Colors" })).toBeInTheDocument();
});

test("shows a list item per color with its hex code", () => {
  render(<ColorPalette colors={colors} />);

  expect(screen.getAllByRole("listitem")).toHaveLength(colors.length);
  colors.forEach((color) => {
    expect(screen.getByText(color)).toBeInTheDocument();
  });
});

test("shows each color as a swatch", () => {
  const { container } = render(<ColorPalette colors={colors} />);

  const swatches = container.querySelectorAll(".swatch");

  expect(swatches).toHaveLength(colors.length);
  swatches.forEach((swatch, index) => {
    expect(swatch).toHaveStyle({ backgroundColor: colors[index] });
  });
});

test("shows a list item for each color even when a color repeats", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  render(<ColorPalette colors={["#37412E", "#37412E"]} />);

  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(consoleError).not.toHaveBeenCalled();
  consoleError.mockRestore();
});

test("renders nothing without colors", () => {
  render(<ColorPalette colors={[]} />);

  expect(
    screen.queryByRole("heading", { name: "Colors" })
  ).not.toBeInTheDocument();
});
