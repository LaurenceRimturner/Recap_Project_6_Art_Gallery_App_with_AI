import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ThemeToggle from "./ThemeToggle";

const root = document.documentElement;

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  root.removeAttribute("data-theme");
  root.classList.remove("theme-transition");
});

test("shows a button that offers dark mode in light mode", () => {
  render(<ThemeToggle />);

  expect(
    screen.getByRole("button", { name: "Switch to dark mode" })
  ).toBeInTheDocument();
  expect(root).toHaveAttribute("data-theme", "light");
});

test("switches between light and dark", async () => {
  render(<ThemeToggle />);

  await userEvent.click(
    screen.getByRole("button", { name: "Switch to dark mode" })
  );

  expect(root).toHaveAttribute("data-theme", "dark");

  await userEvent.click(
    screen.getByRole("button", { name: "Switch to light mode" })
  );

  expect(root).toHaveAttribute("data-theme", "light");
});

test("toggles with Enter and Space", async () => {
  render(<ThemeToggle />);

  await userEvent.tab();
  expect(
    screen.getByRole("button", { name: "Switch to dark mode" })
  ).toHaveFocus();

  await userEvent.keyboard("{Enter}");
  expect(root).toHaveAttribute("data-theme", "dark");

  await userEvent.keyboard(" ");
  expect(root).toHaveAttribute("data-theme", "light");
});

test("shows a moon in light mode and a sun in dark mode", async () => {
  render(<ThemeToggle />);

  const button = screen.getByRole("button");
  expect(button.querySelector("svg")).toHaveClass("lucide-moon");
  expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");

  await userEvent.click(button);

  expect(button.querySelector("svg")).toHaveClass("lucide-sun");
});

test("saves the choice in localStorage", async () => {
  render(<ThemeToggle />);

  await userEvent.click(screen.getByRole("button"));

  expect(localStorage.getItem("theme")).toBe("dark");
});

test("restores the stored theme on mount", () => {
  localStorage.setItem("theme", "dark");

  render(<ThemeToggle />);

  expect(root).toHaveAttribute("data-theme", "dark");
  expect(
    screen.getByRole("button", { name: "Switch to light mode" })
  ).toBeInTheDocument();
});

test("still toggles when saving fails", async () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("quota");
  });
  render(<ThemeToggle />);

  await userEvent.click(screen.getByRole("button"));

  expect(root).toHaveAttribute("data-theme", "dark");
});

test("does not add the transition class on mount", () => {
  render(<ThemeToggle />);

  expect(root).not.toHaveClass("theme-transition");
});

test("adds the transition class only while switching", () => {
  vi.useFakeTimers();
  render(<ThemeToggle />);

  act(() => screen.getByRole("button").click());
  expect(root).toHaveClass("theme-transition");

  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(root).not.toHaveClass("theme-transition");
});

test("ends consistent after two quick clicks", () => {
  vi.useFakeTimers();
  render(<ThemeToggle />);

  act(() => screen.getByRole("button").click());
  act(() => screen.getByRole("button").click());
  expect(root).toHaveAttribute("data-theme", "light");

  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(root).not.toHaveClass("theme-transition");
});

test("removes the transition class on unmount", () => {
  vi.useFakeTimers();
  const { unmount } = render(<ThemeToggle />);

  act(() => screen.getByRole("button").click());
  unmount();

  expect(root).not.toHaveClass("theme-transition");
});
