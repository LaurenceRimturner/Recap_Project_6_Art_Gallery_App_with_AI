import { render, screen } from "@testing-library/react";

import type { ArtPiece } from "../types";
import ArtPieces from "./ArtPieces";

const pieces: ArtPiece[] = [
  {
    slug: "orange-red-and-green",
    artist: "Ad Reinhardt",
    name: "Orange Red and Green",
    imageSource: "https://example.com/orange.jpg",
  },
  {
    slug: "wheat-field",
    artist: "Vincent van Gogh",
    name: "Wheat Field",
    imageSource: "https://example.com/wheat.jpg",
  },
];

test("renders one list item per art piece", () => {
  render(<ArtPieces pieces={pieces} />);

  expect(screen.getAllByRole("listitem")).toHaveLength(pieces.length);
});
