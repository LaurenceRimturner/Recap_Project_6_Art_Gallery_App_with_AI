import { render, screen } from "@testing-library/react";

import type { ArtPiece } from "../types";
import Spotlight from "./Spotlight";

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

afterEach(() => {
  vi.restoreAllMocks();
});

test("shows the image", () => {
  render(<Spotlight pieces={[pieces[0]]} />);

  expect(screen.getByRole("img", { name: pieces[0].name })).toHaveAttribute(
    "src",
    pieces[0].imageSource
  );
});

test("shows the artist's name", () => {
  render(<Spotlight pieces={[pieces[0]]} />);

  expect(screen.getByText(/Ad Reinhardt/)).toBeInTheDocument();
});

test("keeps the same piece on re-render", () => {
  const random = vi
    .spyOn(crypto, "getRandomValues")
    .mockImplementation(<T extends ArrayBufferView>(array: T) => {
      (array as unknown as Uint32Array)[0] = 0;
      return array;
    });
  const { rerender } = render(<Spotlight pieces={pieces} />);
  expect(screen.getByRole("img", { name: pieces[0].name })).toBeInTheDocument();

  random.mockImplementation(<T extends ArrayBufferView>(array: T) => {
    (array as unknown as Uint32Array)[0] = 2 ** 32 - 1;
    return array;
  });
  rerender(<Spotlight pieces={pieces} />);

  expect(screen.getByRole("img", { name: pieces[0].name })).toBeInTheDocument();
  expect(
    screen.queryByRole("img", { name: pieces[1].name })
  ).not.toBeInTheDocument();
});

test("keeps the same piece when the pieces prop changes", () => {
  vi.spyOn(crypto, "getRandomValues").mockImplementation(
    <T extends ArrayBufferView>(array: T) => {
      (array as unknown as Uint32Array)[0] = 0;
      return array;
    }
  );
  const { rerender } = render(<Spotlight pieces={pieces} />);

  rerender(<Spotlight pieces={[...pieces].reverse()} />);

  expect(screen.getByRole("img", { name: pieces[0].name })).toBeInTheDocument();
});

test("renders nothing for an empty array", () => {
  const { container } = render(<Spotlight pieces={[]} />);

  expect(container).toBeEmptyDOMElement();
});
