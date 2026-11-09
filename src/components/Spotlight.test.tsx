import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import Spotlight from "./Spotlight";

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

afterEach(() => {
  vi.restoreAllMocks();
});

test("shows the image", () => {
  render(
    <Spotlight
      pieces={[pieces[0]]}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  expect(screen.getByRole("img", { name: pieces[0].name })).toHaveAttribute(
    "src",
    pieces[0].imageSource
  );
});

test("shows the title", () => {
  render(
    <Spotlight
      pieces={[pieces[0]]}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  expect(screen.getByRole("figure")).toHaveTextContent(`"${pieces[0].name}"`);
});

test("shows the artist's name", () => {
  render(
    <Spotlight
      pieces={[pieces[0]]}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  expect(screen.getByText(/Ad Reinhardt/)).toBeInTheDocument();
});

test("keeps the same piece on re-render", () => {
  const random = vi
    .spyOn(crypto, "getRandomValues")
    .mockImplementation(<T extends ArrayBufferView>(array: T) => {
      (array as unknown as Uint32Array)[0] = 0;
      return array;
    });
  const { rerender } = render(
    <Spotlight
      pieces={pieces}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    {
      wrapper: MemoryRouter,
    }
  );
  expect(screen.getByRole("img", { name: pieces[0].name })).toBeInTheDocument();

  random.mockImplementation(<T extends ArrayBufferView>(array: T) => {
    (array as unknown as Uint32Array)[0] = 2 ** 32 - 1;
    return array;
  });
  rerender(
    <Spotlight
      pieces={pieces}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />
  );

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
  const { rerender } = render(
    <Spotlight
      pieces={pieces}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    {
      wrapper: MemoryRouter,
    }
  );

  rerender(
    <Spotlight
      pieces={[...pieces].reverse()}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />
  );

  expect(screen.getByRole("img", { name: pieces[0].name })).toBeInTheDocument();
});

test("picks a piece once data arrives after an empty first render", () => {
  const random = vi
    .spyOn(crypto, "getRandomValues")
    .mockImplementation(<T extends ArrayBufferView>(array: T) => {
      (array as unknown as Uint32Array)[0] = 0;
      return array;
    });
  const { rerender } = render(
    <Spotlight
      pieces={[]}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    {
      wrapper: MemoryRouter,
    }
  );

  rerender(
    <Spotlight
      pieces={pieces}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />
  );
  expect(screen.getByRole("img", { name: pieces[0].name })).toBeInTheDocument();

  random.mockImplementation(<T extends ArrayBufferView>(array: T) => {
    (array as unknown as Uint32Array)[0] = 2 ** 32 - 1;
    return array;
  });
  rerender(
    <Spotlight
      pieces={pieces}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />
  );

  expect(screen.getByRole("img", { name: pieces[0].name })).toBeInTheDocument();
  expect(
    screen.queryByRole("img", { name: pieces[1].name })
  ).not.toBeInTheDocument();
});

test("links to the details page", () => {
  render(
    <MemoryRouter>
      <Spotlight
        pieces={[pieces[0]]}
        isFavorite={() => false}
        onToggleFavorite={() => {}}
      />
    </MemoryRouter>
  );

  expect(
    screen.getByRole("link", { name: new RegExp(pieces[0].name) })
  ).toHaveAttribute("href", `/art-pieces/${pieces[0].slug}`);
});

test("renders nothing for an empty array", () => {
  const { container } = render(
    <Spotlight
      pieces={[]}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    {
      wrapper: MemoryRouter,
    }
  );

  expect(container).toBeEmptyDOMElement();
});

test("shows a favorite button", () => {
  render(
    <Spotlight
      pieces={[pieces[0]]}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  expect(
    screen.getByRole("button", { name: "Add to favorites" })
  ).toBeInTheDocument();
});

test("shows a favorite as pressed", () => {
  render(
    <Spotlight
      pieces={[pieces[0]]}
      isFavorite={() => true}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  expect(
    screen.getByRole("button", { name: "Remove from favorites" })
  ).toHaveAttribute("aria-pressed", "true");
});

test("toggles the favorite with the slug of the piece", async () => {
  const onToggleFavorite = vi.fn();
  render(
    <Spotlight
      pieces={[pieces[0]]}
      isFavorite={() => false}
      onToggleFavorite={onToggleFavorite}
    />,
    { wrapper: MemoryRouter }
  );

  await userEvent.click(
    screen.getByRole("button", { name: "Add to favorites" })
  );

  expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  expect(onToggleFavorite).toHaveBeenCalledWith(pieces[0].slug);
});
