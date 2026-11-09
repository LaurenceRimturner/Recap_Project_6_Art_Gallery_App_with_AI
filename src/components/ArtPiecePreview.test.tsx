import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

const piece: ArtPiece = {
  slug: "orange-red-and-green",
  artist: "Ad Reinhardt",
  name: "Orange Red and Green",
  imageSource: "https://example.com/orange.jpg",
  year: "1955",
  genre: "Abstract Expressionism",
};

test("shows the image", () => {
  render(<ArtPiecePreview piece={piece} />, { wrapper: MemoryRouter });

  expect(screen.getByRole("img", { name: piece.name })).toHaveAttribute(
    "src",
    piece.imageSource
  );
});

test("shows the title", () => {
  render(<ArtPiecePreview piece={piece} />, { wrapper: MemoryRouter });

  expect(screen.getByRole("figure")).toHaveTextContent(`"${piece.name}"`);
});

test("shows the artist's name", () => {
  render(<ArtPiecePreview piece={piece} />, { wrapper: MemoryRouter });

  expect(screen.getByRole("figure")).toHaveTextContent(`by ${piece.artist}`);
});

test("links to the details page", () => {
  render(
    <MemoryRouter>
      <ArtPiecePreview piece={piece} />
    </MemoryRouter>
  );

  expect(
    screen.getByRole("link", { name: new RegExp(piece.name) })
  ).toHaveAttribute("href", `/art-pieces/${piece.slug}`);
});
