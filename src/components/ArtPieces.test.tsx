import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import ArtPieces from "./ArtPieces";

const pieces: ArtPiece[] = [
  {
    slug: "orange-red-and-green",
    artist: "Ad Reinhardt",
    name: "Orange Red and Green",
    imageSource: "https://example.com/orange.jpg",
    year: "1955",
    genre: "Abstract Expressionism",
    colors: ["#37412E", "#8D7332"],
  },
  {
    slug: "wheat-field",
    artist: "Vincent van Gogh",
    name: "Wheat Field",
    imageSource: "https://example.com/wheat.jpg",
    year: "1888",
    genre: "Post-Impressionism",
    colors: ["#37412E", "#8D7332"],
  },
];

test("renders one list item per art piece", () => {
  render(
    <ArtPieces
      pieces={pieces}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  expect(screen.getAllByRole("listitem")).toHaveLength(pieces.length);
});

test("shows a favorite button for each piece", () => {
  render(
    <ArtPieces
      pieces={pieces}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  expect(screen.getAllByRole("button", { name: /favorite/i })).toHaveLength(
    pieces.length
  );
});

test("shows the image, title and artist of each piece", () => {
  render(
    <ArtPieces
      pieces={pieces}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  const figures = screen.getAllByRole("figure");
  expect(figures).toHaveLength(pieces.length);
  pieces.forEach((piece, index) => {
    expect(screen.getByRole("img", { name: piece.name })).toHaveAttribute(
      "src",
      piece.imageSource
    );
    expect(figures[index]).toHaveTextContent(piece.name);
    expect(figures[index]).toHaveTextContent(piece.artist);
  });
});

test("links each piece to its details page", () => {
  render(
    <ArtPieces
      pieces={pieces}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  const items = screen.getAllByRole("listitem");
  pieces.forEach((piece, index) => {
    expect(within(items[index]).getByRole("link")).toHaveAttribute(
      "href",
      `/art-pieces/${piece.slug}`
    );
  });
});

test("marks only favorite pieces as pressed", () => {
  render(
    <ArtPieces
      pieces={pieces}
      isFavorite={(slug) => slug === pieces[1].slug}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  const [first, second] = screen.getAllByRole("listitem");
  expect(
    within(first).getByRole("button", { name: "Add to favorites" })
  ).toHaveAttribute("aria-pressed", "false");
  expect(
    within(second).getByRole("button", { name: "Remove from favorites" })
  ).toHaveAttribute("aria-pressed", "true");
});

test("toggles the favorite of the clicked piece", async () => {
  const onToggleFavorite = vi.fn();
  render(
    <ArtPieces
      pieces={pieces}
      isFavorite={() => false}
      onToggleFavorite={onToggleFavorite}
    />,
    { wrapper: MemoryRouter }
  );

  await userEvent.click(
    screen.getAllByRole("button", { name: "Add to favorites" })[1]
  );

  expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  expect(onToggleFavorite).toHaveBeenCalledWith(pieces[1].slug);
});

test("renders an empty list for no pieces", () => {
  render(
    <ArtPieces
      pieces={[]}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  expect(screen.getByRole("list")).toBeInTheDocument();
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
});
