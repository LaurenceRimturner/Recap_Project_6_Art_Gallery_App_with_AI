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
