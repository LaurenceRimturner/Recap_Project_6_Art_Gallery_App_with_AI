import { render, screen } from "@testing-library/react";

import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

const piece: ArtPiece = {
  slug: "orange-red-and-green",
  artist: "Ad Reinhardt",
  name: "Orange Red and Green",
  imageSource: "https://example.com/orange.jpg",
};

test("shows the image", () => {
  render(<ArtPiecePreview piece={piece} />);

  expect(screen.getByRole("img", { name: piece.name })).toHaveAttribute(
    "src",
    piece.imageSource
  );
});

test("shows the title", () => {
  render(<ArtPiecePreview piece={piece} />);

  expect(screen.getByRole("figure")).toHaveTextContent(`"${piece.name}"`);
});

test("shows the artist's name", () => {
  render(<ArtPiecePreview piece={piece} />);

  expect(screen.getByRole("figure")).toHaveTextContent(`by ${piece.artist}`);
});
