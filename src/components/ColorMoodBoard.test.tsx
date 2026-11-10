import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ColorMoodBoard from "./ColorMoodBoard";

const colors = ["#2E7D32", "#66BB6A", "#1F3A93", "#4B6A88", "#2E7D32"];

test("renders one selectable chip per color family present", () => {
  render(
    <ColorMoodBoard colors={colors} selected={null} onToggle={() => {}} />
  );

  expect(screen.getAllByRole("button")).toHaveLength(2);
  expect(screen.getByRole("button", { name: "green" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "blue" })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "purple" })
  ).not.toBeInTheDocument();
});

test("shows a single dot with the first color of the family", () => {
  render(
    <ColorMoodBoard colors={colors} selected={null} onToggle={() => {}} />
  );

  const dots = screen
    .getByRole("button", { name: "green" })
    .querySelectorAll(".dot");
  expect(dots).toHaveLength(1);
  expect(dots[0]).toHaveStyle({ backgroundColor: "#2E7D32" });
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

test("reports the family of the clicked chip", async () => {
  const onToggle = vi.fn();
  render(
    <ColorMoodBoard colors={colors} selected={null} onToggle={onToggle} />
  );

  await userEvent.click(screen.getByRole("button", { name: "blue" }));

  expect(onToggle).toHaveBeenCalledTimes(1);
  expect(onToggle).toHaveBeenCalledWith("blue");
});

test("shows a chip for red", async () => {
  const onToggle = vi.fn();
  render(
    <ColorMoodBoard colors={["#D32F2F"]} selected={null} onToggle={onToggle} />
  );

  await userEvent.click(screen.getByRole("button", { name: "red" }));

  expect(onToggle).toHaveBeenCalledWith("red");
});

test("shows no chip for greys", () => {
  render(
    <ColorMoodBoard
      colors={["#808080", "#000000", "#FFFFFF"]}
      selected={null}
      onToggle={() => {}}
    />
  );

  expect(screen.queryAllByRole("button")).toHaveLength(0);
});
