import { filterPieces, type Filters } from "./filterPieces";
import type { ArtPiece } from "./types";

const pieces: ArtPiece[] = [
  {
    slug: "orange-red-and-green",
    artist: "Ad Reinhardt",
    name: "Orange Red and Green",
    imageSource: "https://example.com/orange.jpg",
    year: "1955",
    genre: "Abstract Expressionism",
    colors: ["#D32F2F", "#37412E"],
  },
  {
    slug: "wheat-field",
    artist: "Vincent van Gogh",
    name: "Wheat Field",
    imageSource: "https://example.com/wheat.jpg",
    year: "1888",
    genre: "Post-Impressionism",
    colors: ["#E8C547", "#4B6A88"],
  },
  {
    slug: "starry-night",
    artist: "Vincent van Gogh",
    name: "Starry Night",
    imageSource: "https://example.com/starry.jpg",
    year: "1889",
    genre: "Post-Impressionism",
    colors: ["#1F3A93", "#E8C547"],
  },
];

const noFilters: Filters = { search: "", family: null, genre: "" };

test("returns all pieces when no filter is active", () => {
  expect(filterPieces(pieces, noFilters)).toEqual(pieces);
});

test("matches the name case-insensitively", () => {
  const result = filterPieces(pieces, { ...noFilters, search: "wHeAt" });

  expect(result.map((piece) => piece.slug)).toEqual(["wheat-field"]);
});

test("keeps pieces with a color in a selected family", () => {
  const result = filterPieces(pieces, { ...noFilters, family: "yellow" });

  expect(result.map((piece) => piece.slug)).toEqual([
    "wheat-field",
    "starry-night",
  ]);
});

test("keeps only pieces of the selected genre", () => {
  const result = filterPieces(pieces, {
    ...noFilters,
    genre: "Abstract Expressionism",
  });

  expect(result.map((piece) => piece.slug)).toEqual(["orange-red-and-green"]);
});

test("requires all active filters to match", () => {
  const result = filterPieces(pieces, {
    search: "starry",
    family: "yellow",
    genre: "Post-Impressionism",
  });
  expect(result.map((piece) => piece.slug)).toEqual(["starry-night"]);

  expect(
    filterPieces(pieces, {
      search: "wheat",
      family: "yellow",
      genre: "Abstract Expressionism",
    })
  ).toEqual([]);
  expect(
    filterPieces(pieces, { search: "wheat", family: "red", genre: "" })
  ).toEqual([]);
});

test("matches the artist case-insensitively", () => {
  const result = filterPieces(pieces, { ...noFilters, search: "GOGH" });

  expect(result.map((piece) => piece.slug)).toEqual([
    "wheat-field",
    "starry-night",
  ]);
});
