import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import ArtPieceDetails from "./ArtPieceDetails";

const piece: ArtPiece = {
  slug: "orange-red-and-green",
  artist: "Ad Reinhardt",
  name: "Orange Red and Green",
  imageSource: "https://example.com/orange.jpg",
  year: "1955",
  genre: "Abstract Expressionism",
};

function renderDetails() {
  return render(
    <MemoryRouter>
      <ArtPieceDetails
        piece={piece}
        isFavorite={false}
        onToggleFavorite={() => {}}
      />
    </MemoryRouter>
  );
}

test("shows the image", () => {
  renderDetails();

  expect(screen.getByRole("img", { name: piece.name })).toHaveAttribute(
    "src",
    piece.imageSource
  );
});

test("shows the title", () => {
  renderDetails();

  expect(screen.getByRole("heading", { name: piece.name })).toBeInTheDocument();
});

test("shows the artist", () => {
  renderDetails();

  expect(screen.getByText(piece.artist, { exact: false })).toBeInTheDocument();
});

test("shows the year", () => {
  renderDetails();

  expect(screen.getByText(piece.year, { exact: false })).toBeInTheDocument();
});

test("shows the genre", () => {
  renderDetails();

  expect(screen.getByText(piece.genre, { exact: false })).toBeInTheDocument();
});

test("shows a back link", () => {
  renderDetails();

  expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
    "href",
    "/art-pieces"
  );
});

test("shows a favorite button", () => {
  renderDetails();

  expect(
    screen.getByRole("button", { name: "Add to favorites" })
  ).toBeInTheDocument();
});

test("shows a favorite as pressed", () => {
  render(
    <MemoryRouter>
      <ArtPieceDetails piece={piece} isFavorite onToggleFavorite={() => {}} />
    </MemoryRouter>
  );

  expect(
    screen.getByRole("button", { name: "Remove from favorites" })
  ).toHaveAttribute("aria-pressed", "true");
});

test("calls onToggleFavorite when the favorite button is clicked", async () => {
  const onToggleFavorite = vi.fn();
  render(
    <MemoryRouter>
      <ArtPieceDetails
        piece={piece}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      />
    </MemoryRouter>
  );

  await userEvent.click(screen.getByRole("button", { name: /favorite/i }));

  expect(onToggleFavorite).toHaveBeenCalledTimes(1);
});
