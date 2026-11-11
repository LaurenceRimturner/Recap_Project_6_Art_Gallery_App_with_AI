import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FavoriteButton from "./FavoriteButton";

test("calls onToggle on click", async () => {
  const onToggle = vi.fn();
  render(<FavoriteButton isFavorite={false} onToggle={onToggle} />);

  await userEvent.click(screen.getByRole("button", { name: /favorite/i }));

  expect(onToggle).toHaveBeenCalledTimes(1);
});

test("is not pressed for a non-favorite", () => {
  render(<FavoriteButton isFavorite={false} onToggle={() => {}} />);

  expect(
    screen.getByRole("button", { name: "Add to favorites" })
  ).toHaveAttribute("aria-pressed", "false");
});

test("is pressed for a favorite", () => {
  render(<FavoriteButton isFavorite onToggle={() => {}} />);

  expect(
    screen.getByRole("button", { name: "Remove from favorites" })
  ).toHaveAttribute("aria-pressed", "true");
});

const heart = () => document.querySelector(".favorite-icon");

test("pops the heart when it becomes a favorite", () => {
  const { rerender } = render(
    <FavoriteButton isFavorite={false} onToggle={() => {}} />
  );

  rerender(<FavoriteButton isFavorite onToggle={() => {}} />);

  expect(heart()).toHaveStyle({ transform: "scale(0.7, 0.7)" });
});

test("does not pop the heart when unfavoriting", () => {
  const { rerender } = render(
    <FavoriteButton isFavorite onToggle={() => {}} />
  );

  rerender(<FavoriteButton isFavorite={false} onToggle={() => {}} />);

  expect(heart()).not.toHaveStyle({ transform: "scale(0.7, 0.7)" });
});

test("does not pop the heart on first render", () => {
  render(<FavoriteButton isFavorite onToggle={() => {}} />);

  expect(heart()).not.toHaveStyle({ transform: "scale(0.7, 0.7)" });
});
