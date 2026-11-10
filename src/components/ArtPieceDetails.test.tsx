import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  colors: ["#37412E", "#8D7332"],
};

function renderDetails() {
  return render(
    <MemoryRouter>
      <ArtPieceDetails
        piece={piece}
        isFavorite={false}
        onToggleFavorite={() => {}}
        comments={[]}
        onAddComment={() => {}}
        onEditComment={() => {}}
        onDeleteComment={() => {}}
      />
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

test("shows the color palette", () => {
  renderDetails();

  expect(screen.getByRole("heading", { name: "Colors" })).toBeInTheDocument();
  piece.colors.forEach((color) => {
    expect(screen.getByText(color)).toBeInTheDocument();
  });
});

test("shows a back link", () => {
  renderDetails();

  expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
    "href",
    "/art-pieces"
  );
});

test("shows a favorite button", () => {
  renderDetails();

  expect(
    screen.getByRole("button", { name: "Add to favorites" })
  ).toBeInTheDocument();
});

test("shows a favorite as pressed", () => {
  render(
    <MemoryRouter>
      <ArtPieceDetails
        piece={piece}
        isFavorite
        onToggleFavorite={() => {}}
        comments={[]}
        onAddComment={() => {}}
        onEditComment={() => {}}
        onDeleteComment={() => {}}
      />
    </MemoryRouter>
  );

  expect(
    screen.getByRole("button", { name: "Remove from favorites" })
  ).toHaveAttribute("aria-pressed", "true");
});

test("calls onToggleFavorite when the favorite button is clicked", async () => {
  const onToggleFavorite = vi.fn();
  render(
    <MemoryRouter>
      <ArtPieceDetails
        piece={piece}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
        comments={[]}
        onAddComment={() => {}}
        onEditComment={() => {}}
        onDeleteComment={() => {}}
      />
    </MemoryRouter>
  );

  await userEvent.click(screen.getByRole("button", { name: /favorite/i }));

  expect(onToggleFavorite).toHaveBeenCalledTimes(1);
});

test("shows the comments of the art piece", () => {
  render(
    <MemoryRouter>
      <ArtPieceDetails
        piece={piece}
        isFavorite={false}
        onToggleFavorite={() => {}}
        comments={[{ text: "Lovely colors", date: "2025-03-01T09:15:00.000Z" }]}
        onAddComment={() => {}}
        onEditComment={() => {}}
        onDeleteComment={() => {}}
      />
    </MemoryRouter>
  );

  expect(screen.getByRole("heading", { name: "Comments" })).toBeInTheDocument();
  expect(screen.getByText("Lovely colors")).toBeInTheDocument();
});

test("calls onAddComment when a comment is submitted", async () => {
  const onAddComment = vi.fn();
  render(
    <MemoryRouter>
      <ArtPieceDetails
        piece={piece}
        isFavorite={false}
        onToggleFavorite={() => {}}
        comments={[]}
        onAddComment={onAddComment}
        onEditComment={() => {}}
        onDeleteComment={() => {}}
      />
    </MemoryRouter>
  );

  await userEvent.type(screen.getByRole("textbox"), "Lovely colors");
  await userEvent.click(screen.getByRole("button", { name: "Submit" }));

  expect(onAddComment).toHaveBeenCalledWith("Lovely colors");
});

test("shows the comments in their own section with the form inside it", () => {
  renderDetails();

  const section = screen
    .getByRole("heading", { name: "Comments" })
    .closest("section") as HTMLElement;

  expect(section).toHaveClass("comment-section");
  expect(within(section).getByRole("textbox")).toBeInTheDocument();
});

test("passes edit and delete of a comment on", async () => {
  const onEditComment = vi.fn();
  const onDeleteComment = vi.fn();
  const date = "2025-03-01T09:15:00.000Z";
  render(
    <MemoryRouter>
      <ArtPieceDetails
        piece={piece}
        isFavorite={false}
        onToggleFavorite={() => {}}
        comments={[{ text: "Lovely colors", date }]}
        onAddComment={() => {}}
        onEditComment={onEditComment}
        onDeleteComment={onDeleteComment}
      />
    </MemoryRouter>
  );

  await userEvent.click(screen.getByRole("button", { name: "Edit" }));
  await userEvent.type(screen.getByLabelText("Edit comment"), "!");
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  await userEvent.click(screen.getByRole("button", { name: "Delete" }));
  await userEvent.click(screen.getByRole("button", { name: "Confirm delete" }));

  expect(onEditComment).toHaveBeenCalledWith(date, "Lovely colors!");
  expect(onDeleteComment).toHaveBeenCalledWith(date);
});

test("does not fade in the comments of another art piece shown in the same view", () => {
  const props = {
    isFavorite: false,
    onToggleFavorite: () => {},
    onAddComment: () => {},
    onEditComment: () => {},
    onDeleteComment: () => {},
  };
  const { rerender } = render(
    <MemoryRouter>
      <ArtPieceDetails piece={piece} comments={[]} {...props} />
    </MemoryRouter>
  );

  rerender(
    <MemoryRouter>
      <ArtPieceDetails
        piece={{ ...piece, slug: "wheat-field", name: "Wheat Field" }}
        comments={[{ text: "Golden light", date: "2026-01-01T00:00:00.000Z" }]}
        {...props}
      />
    </MemoryRouter>
  );

  expect(screen.getByText("Golden light").closest("li")).not.toHaveClass(
    "fade-in"
  );
});
