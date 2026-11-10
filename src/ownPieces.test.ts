import { parseOwnPieces } from "./ownPieces";

const valid = {
  slug: "own-1",
  artist: "Me",
  name: "Sunrise",
  imageSource: "https://example.com/sunrise.jpg",
  year: "2024",
  genre: "Impressionism",
  colors: [],
};

test("returns an empty list for anything that is not an array", () => {
  expect(parseOwnPieces(undefined)).toEqual([]);
  expect(parseOwnPieces(null)).toEqual([]);
  expect(parseOwnPieces({})).toEqual([]);
  expect(parseOwnPieces("text")).toEqual([]);
});

test("keeps valid pieces", () => {
  expect(parseOwnPieces([valid])).toEqual([valid]);
});

test("drops entries that are not objects", () => {
  expect(parseOwnPieces([null, 1, "x", [], valid])).toEqual([valid]);
});

test.each(["slug", "artist", "name", "imageSource", "year", "genre"])(
  "drops an entry with a missing or empty %s",
  (field) => {
    const missing: Record<string, unknown> = { ...valid, [field]: undefined };

    expect(parseOwnPieces([missing])).toEqual([]);
    expect(parseOwnPieces([{ ...valid, [field]: "  " }])).toEqual([]);
    expect(parseOwnPieces([{ ...valid, [field]: 5 }])).toEqual([]);
  }
);

test.each(["javascript:alert(1)", "data:image/png;base64,AAAA", "nope"])(
  "drops an entry whose image URL is %s",
  (imageSource) => {
    expect(parseOwnPieces([{ ...valid, imageSource }])).toEqual([]);
  }
);

test("always gives pieces an empty colors list", () => {
  const withoutColors = { ...valid, colors: undefined };

  expect(parseOwnPieces([withoutColors])[0].colors).toEqual([]);
  expect(parseOwnPieces([{ ...valid, colors: "red" }])[0].colors).toEqual([]);
});
