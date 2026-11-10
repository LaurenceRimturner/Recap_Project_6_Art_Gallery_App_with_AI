import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ColorMoodBoard from "./ColorMoodBoard";

const colors = ["#2E7D32", "#66BB6A", "#1F3A93", "#4B6A88", "#2E7D32"];

test("renders one selectable group per color family present", () => {
  render(
    <ColorMoodBoard colors={colors} selected={null} onToggle={() => {}} />
  );

  const groups = screen.getAllByRole("button");
  expect(groups).toHaveLength(2);
  expect(screen.getByRole("button", { name: "green" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "blue" })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "purple" })
  ).not.toBeInTheDocument();
});

test("shows each distinct color as a swatch inside its family group", () => {
  render(
    <ColorMoodBoard colors={colors} selected={null} onToggle={() => {}} />
  );

  const green = screen.getByRole("button", { name: "green" });
  const swatches = green.querySelectorAll(".swatch");
  expect(swatches).toHaveLength(2);
  expect(swatches[0]).toHaveStyle({ backgroundColor: "#2E7D32" });
  expect(swatches[1]).toHaveStyle({ backgroundColor: "#66BB6A" });
});

test("shows at most 6 swatches per group", () => {
  const manyBlues = [
    "#1F3A93",
    "#2040A0",
    "#2447AD",
    "#284EBA",
    "#2C55C7",
    "#305CD4",
    "#3463E1",
    "#386AEE",
  ];
  render(
    <ColorMoodBoard colors={manyBlues} selected={null} onToggle={() => {}} />
  );

  const blue = screen.getByRole("button", { name: "blue" });
  expect(blue.querySelectorAll(".swatch")).toHaveLength(6);
});

test("marks only the selected family as pressed", () => {
  render(
    <ColorMoodBoard colors={colors} selected="blue" onToggle={() => {}} />
  );

  expect(screen.getByRole("button", { name: "blue" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  expect(screen.getByRole("button", { name: "green" })).toHaveAttribute(
    "aria-pressed",
    "false"
  );
});

test("reports the family of the clicked group", async () => {
  const onToggle = vi.fn();
  render(
    <ColorMoodBoard colors={colors} selected={null} onToggle={onToggle} />
  );

  await userEvent.click(screen.getByRole("button", { name: "blue" }));

  expect(onToggle).toHaveBeenCalledTimes(1);
  expect(onToggle).toHaveBeenCalledWith("blue");
});

test("shows beige colors in a neutral group", async () => {
  const onToggle = vi.fn();
  render(
    <ColorMoodBoard
      colors={["#D9C9A8", "#C2B280"]}
      selected={null}
      onToggle={onToggle}
    />
  );

  await userEvent.click(screen.getByRole("button", { name: "neutral" }));

  expect(onToggle).toHaveBeenCalledWith("neutral");
});

test("shows no group for greys or reds", () => {
  render(
    <ColorMoodBoard
      colors={["#808080", "#000000", "#FFFFFF", "#D32F2F"]}
      selected={null}
      onToggle={() => {}}
    />
  );

  expect(screen.queryAllByRole("button")).toHaveLength(0);
});
