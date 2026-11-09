import { render, screen } from "@testing-library/react";
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
      <ArtPieceDetails piece={piece} />
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
