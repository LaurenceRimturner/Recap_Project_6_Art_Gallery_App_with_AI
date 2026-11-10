import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

const piece: ArtPiece = {
  slug: "orange-red-and-green",
  artist: "Ad Reinhardt",
  name: "Orange Red and Green",
  imageSource: "https://example.com/orange.jpg",
  year: "1955",
  genre: "Abstract Expressionism",
  colors: ["#37412E", "#8D7332"],
};

test("shows the image", () => {
  render(
    <ArtPiecePreview
      piece={piece}
      isFavorite={false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  expect(screen.getByRole("img", { name: piece.name })).toHaveAttribute(
    "src",
    piece.imageSource
  );
});

test("shows the title", () => {
  render(
    <ArtPiecePreview
      piece={piece}
      isFavorite={false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  expect(screen.getByRole("figure")).toHaveTextContent(`"${piece.name}"`);
});

test("shows the artist's name", () => {
  render(
    <ArtPiecePreview
      piece={piece}
      isFavorite={false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  expect(screen.getByRole("figure")).toHaveTextContent(`by ${piece.artist}`);
});

test("links to the details page", () => {
  render(
    <MemoryRouter>
      <ArtPiecePreview
        piece={piece}
        isFavorite={false}
        onToggleFavorite={() => {}}
      />
    </MemoryRouter>
  );

  expect(
    screen.getByRole("link", { name: new RegExp(piece.name) })
  ).toHaveAttribute("href", `/art-pieces/${piece.slug}`);
});

test("shows a favorite button", () => {
  render(
    <ArtPiecePreview
      piece={piece}
      isFavorite={false}
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
    <ArtPiecePreview piece={piece} isFavorite onToggleFavorite={() => {}} />,
    { wrapper: MemoryRouter }
  );

  expect(
    screen.getByRole("button", { name: "Remove from favorites" })
  ).toHaveAttribute("aria-pressed", "true");
});

test("clicking the favorite button toggles without opening the details page", async () => {
  const onToggleFavorite = vi.fn();
  render(
    <MemoryRouter initialEntries={["/art-pieces"]}>
      <Routes>
        <Route
          path="/art-pieces"
          element={
            <ArtPiecePreview
              piece={piece}
              isFavorite={false}
              onToggleFavorite={onToggleFavorite}
            />
          }
        />
        <Route path="/art-pieces/:slug" element={<p>Details page</p>} />
      </Routes>
    </MemoryRouter>
  );

  await userEvent.click(screen.getByRole("button", { name: /favorite/i }));

  expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("Details page")).not.toBeInTheDocument();
});

test("shows an Added by you badge only for custom pieces", () => {
  const { rerender } = render(
    <ArtPiecePreview
      piece={{ ...piece, isCustom: true }}
      isFavorite={false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );

  expect(screen.getByText("Added by you")).toBeInTheDocument();

  rerender(
    <ArtPiecePreview
      piece={piece}
      isFavorite={false}
      onToggleFavorite={() => {}}
    />
  );

  expect(screen.queryByText("Added by you")).not.toBeInTheDocument();
});
