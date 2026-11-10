import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import Gallery from "./Gallery";

const pieces: ArtPiece[] = [
  {
    slug: "orange-red-and-green",
    artist: "Ad Reinhardt",
    name: "Orange Red and Green",
    imageSource: "https://example.com/orange.jpg",
    year: "1955",
    genre: "Abstract Expressionism",
    colors: ["#D32F2F", "#2E7D32"],
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

function renderGallery(galleryPieces = pieces) {
  render(
    <Gallery
      pieces={galleryPieces}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );
}

function shownNames() {
  return screen.queryAllByRole("figure").map((figure) => figure.textContent);
}

test("shows all art pieces when no filter is active", () => {
  renderGallery();

  expect(shownNames()).toHaveLength(pieces.length);
  pieces.forEach((piece) => {
    expect(screen.getByRole("img", { name: piece.name })).toBeInTheDocument();
  });
});

test("filters by the typed search text", async () => {
  renderGallery();

  await userEvent.type(
    screen.getByLabelText("Search by name or artist"),
    "reinhardt"
  );

  expect(
    screen.getByRole("img", { name: "Orange Red and Green" })
  ).toBeVisible();
  expect(
    screen.queryByRole("img", { name: "Wheat Field" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("img", { name: "Starry Night" })
  ).not.toBeInTheDocument();
});

test("shows only pieces with a color in the selected family", async () => {
  renderGallery();

  await userEvent.click(screen.getByRole("button", { name: "green" }));

  expect(
    screen.getByRole("img", { name: "Orange Red and Green" })
  ).toBeVisible();
  expect(
    screen.queryByRole("img", { name: "Wheat Field" })
  ).not.toBeInTheDocument();
});

test("keeps only one family active at a time", async () => {
  renderGallery();

  await userEvent.click(screen.getByRole("button", { name: "green" }));
  await userEvent.click(screen.getByRole("button", { name: "yellow" }));

  expect(screen.getByRole("button", { name: "green" })).toHaveAttribute(
    "aria-pressed",
    "false"
  );
  expect(screen.getByRole("button", { name: "yellow" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  expect(shownNames()).toHaveLength(2);
  expect(
    screen.queryByRole("img", { name: "Orange Red and Green" })
  ).not.toBeInTheDocument();
});

test("restores the pieces when the selected family is deselected", async () => {
  renderGallery();

  await userEvent.click(screen.getByRole("button", { name: "green" }));
  await userEvent.click(screen.getByRole("button", { name: "green" }));

  expect(shownNames()).toHaveLength(pieces.length);
});

test("lists every genre once plus an all genres option", () => {
  renderGallery();

  const options = screen
    .getAllByRole("option")
    .map((option) => option.textContent);
  expect(options).toEqual([
    "All genres",
    "Abstract Expressionism",
    "Post-Impressionism",
  ]);
});

test("filters by the chosen genre", async () => {
  renderGallery();

  await userEvent.selectOptions(
    screen.getByLabelText("Genre"),
    "Post-Impressionism"
  );

  expect(shownNames()).toHaveLength(2);
  expect(
    screen.queryByRole("img", { name: "Orange Red and Green" })
  ).not.toBeInTheDocument();
});

test("combines search, color and genre", async () => {
  renderGallery();

  await userEvent.type(
    screen.getByLabelText("Search by name or artist"),
    "van"
  );
  await userEvent.click(screen.getByRole("button", { name: "blue" }));
  await userEvent.selectOptions(
    screen.getByLabelText("Genre"),
    "Post-Impressionism"
  );
  expect(shownNames()).toHaveLength(2);

  await userEvent.clear(screen.getByLabelText("Search by name or artist"));
  await userEvent.type(
    screen.getByLabelText("Search by name or artist"),
    "wheat"
  );

  expect(shownNames()).toHaveLength(1);
  expect(screen.getByRole("img", { name: "Wheat Field" })).toBeVisible();
});

test("disables the clear button while no filter is active", () => {
  renderGallery();

  expect(screen.getByRole("button", { name: "Clear filters" })).toBeDisabled();
});

test("enables the clear button once a filter is active", async () => {
  renderGallery();

  await userEvent.click(screen.getByRole("button", { name: "green" }));

  expect(screen.getByRole("button", { name: "Clear filters" })).toBeEnabled();
});

test("clears search, color and genre at once", async () => {
  renderGallery();
  await userEvent.type(
    screen.getByLabelText("Search by name or artist"),
    "van"
  );
  await userEvent.click(screen.getByRole("button", { name: "blue" }));
  await userEvent.selectOptions(
    screen.getByLabelText("Genre"),
    "Post-Impressionism"
  );

  await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));

  expect(screen.getByLabelText("Search by name or artist")).toHaveValue("");
  expect(screen.getByLabelText("Genre")).toHaveValue("");
  expect(screen.getByRole("button", { name: "blue" })).toHaveAttribute(
    "aria-pressed",
    "false"
  );
  expect(shownNames()).toHaveLength(pieces.length);
  expect(screen.getByRole("button", { name: "Clear filters" })).toBeDisabled();
});

test("shows a message when no art piece matches", async () => {
  renderGallery();

  await userEvent.type(
    screen.getByLabelText("Search by name or artist"),
    "no such piece"
  );

  expect(screen.getByText("No art pieces found.")).toBeInTheDocument();
  expect(screen.queryAllByRole("figure")).toHaveLength(0);
});

test("does not show the message while pieces match", () => {
  renderGallery();

  expect(screen.queryByText("No art pieces found.")).not.toBeInTheDocument();
});

test("announces the empty message as a status", async () => {
  renderGallery();

  await userEvent.type(
    screen.getByLabelText("Search by name or artist"),
    "no such piece"
  );

  expect(screen.getByRole("status")).toHaveTextContent("No art pieces found.");
});

test("keeps an empty status region mounted while pieces match", () => {
  renderGallery();

  expect(screen.getByRole("status")).toBeEmptyDOMElement();
});

test("keeps pieces with only red or grey colors, hidden by any color group", async () => {
  const redOnly: ArtPiece = {
    ...pieces[0],
    slug: "red-only",
    name: "Red Only",
    colors: ["#D32F2F"],
  };
  const greyOnly: ArtPiece = {
    ...pieces[0],
    slug: "grey-only",
    name: "Grey Only",
    colors: ["#808080"],
  };
  renderGallery([redOnly, greyOnly, pieces[1]]);

  expect(shownNames()).toHaveLength(3);

  await userEvent.click(screen.getByRole("button", { name: "yellow" }));

  expect(shownNames()).toHaveLength(1);
  expect(
    screen.queryByRole("img", { name: "Red Only" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("img", { name: "Grey Only" })
  ).not.toBeInTheDocument();
});

const customPiece: ArtPiece = {
  slug: "own-sunrise",
  artist: "Me",
  name: "Sunrise",
  imageSource: "https://example.com/sunrise.jpg",
  year: "2024",
  genre: "Impressionism",
  colors: [],
  isCustom: true,
};

test("shows no own-pieces filter when there are no custom pieces", () => {
  renderGallery();

  expect(
    screen.queryByRole("checkbox", { name: "Only my art pieces" })
  ).not.toBeInTheDocument();
});

test("shows only custom pieces when Only my art pieces is checked", async () => {
  renderGallery([...pieces, customPiece]);

  await userEvent.click(
    screen.getByRole("checkbox", { name: "Only my art pieces" })
  );

  expect(screen.getByRole("img", { name: "Sunrise" })).toBeInTheDocument();
  expect(
    screen.queryByRole("img", { name: "Wheat Field" })
  ).not.toBeInTheDocument();

  await userEvent.click(
    screen.getByRole("checkbox", { name: "Only my art pieces" })
  );

  expect(screen.getByRole("img", { name: "Wheat Field" })).toBeInTheDocument();
});

test("combines Only my art pieces with the other filters", async () => {
  renderGallery([...pieces, customPiece]);

  await userEvent.click(
    screen.getByRole("checkbox", { name: "Only my art pieces" })
  );
  await userEvent.selectOptions(
    screen.getByLabelText("Genre"),
    "Post-Impressionism"
  );

  expect(screen.getByText("No art pieces found.")).toBeInTheDocument();
});

test("clear filters also unchecks Only my art pieces", async () => {
  renderGallery([...pieces, customPiece]);
  const checkbox = screen.getByRole("checkbox", { name: "Only my art pieces" });
  const clear = screen.getByRole("button", { name: "Clear filters" });
  expect(clear).toBeDisabled();

  await userEvent.click(checkbox);
  expect(clear).toBeEnabled();
  await userEvent.click(clear);

  expect(checkbox).not.toBeChecked();
  expect(clear).toBeDisabled();
  expect(screen.getByRole("img", { name: "Wheat Field" })).toBeInTheDocument();
});
