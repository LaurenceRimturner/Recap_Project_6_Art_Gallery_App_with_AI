import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ArtPiece } from "../types";
import ArtPieceModal from "./ArtPieceModal";

const piece: ArtPiece = {
  slug: "own-sunrise-1",
  artist: "Me",
  name: "Sunrise",
  imageSource: "https://example.com/sunrise.jpg",
  year: "2024",
  genre: "Impressionism",
  colors: [],
};

function renderModal(props: Partial<Parameters<typeof ArtPieceModal>[0]> = {}) {
  const onSave = vi.fn();
  const onClose = vi.fn();
  render(<ArtPieceModal onSave={onSave} onClose={onClose} {...props} />);
  return { onSave, onClose };
}

async function fillIn(values: Record<string, string>) {
  for (const [label, value] of Object.entries(values)) {
    const field = screen.getByLabelText(label);
    await userEvent.clear(field);
    if (value) await userEvent.type(field, value);
  }
}

const validValues = {
  "Image URL": "https://example.com/a.jpg",
  Name: "Starry",
  Artist: "Vincent",
  Genre: "Post-Impressionism",
  Year: "1889",
};

test("shows labelled fields for image URL, name, artist, genre and year", () => {
  renderModal();

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  for (const label of ["Image URL", "Name", "Artist", "Genre", "Year"]) {
    expect(screen.getByLabelText(label)).toBeInTheDocument();
  }
});

test("shows an error for each empty field and does not save", async () => {
  const { onSave } = renderModal();

  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  expect(onSave).not.toHaveBeenCalled();
  for (const label of ["Image URL", "Name", "Artist", "Genre", "Year"]) {
    expect(
      screen.getByText(`${label} is required.`, { exact: false })
    ).toBeInTheDocument();
  }
});

test("rejects whitespace-only values", async () => {
  const { onSave } = renderModal();

  await fillIn({ ...validValues, Name: "   " });
  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  expect(onSave).not.toHaveBeenCalled();
  expect(screen.getByText("Name is required.")).toBeInTheDocument();
});

test("rejects an invalid image URL", async () => {
  const { onSave } = renderModal();

  for (const bad of ["not-a-url", "ftp://example.com/a.jpg"]) {
    await fillIn({ ...validValues, "Image URL": bad });
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(
      screen.getByText("Image URL must be a valid http or https URL.")
    ).toBeInTheDocument();
  }
});

test("accepts http and https URLs", async () => {
  const { onSave } = renderModal();

  await fillIn({ ...validValues, "Image URL": "http://example.com/a.jpg" });
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  await fillIn({ "Image URL": "https://example.com/a.jpg" });
  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  expect(onSave).toHaveBeenCalledTimes(2);
});

test("calls onSave with trimmed values", async () => {
  const { onSave } = renderModal();

  await fillIn({ ...validValues, Name: "  Starry Night  " });
  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  expect(onSave).toHaveBeenCalledWith({
    imageSource: "https://example.com/a.jpg",
    name: "Starry Night",
    artist: "Vincent",
    genre: "Post-Impressionism",
    year: "1889",
  });
});

test("closes with the Close button without saving", async () => {
  const { onSave, onClose } = renderModal();

  await userEvent.click(screen.getByRole("button", { name: "Close" }));

  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onSave).not.toHaveBeenCalled();
});

test("closes on Escape without saving", () => {
  const { onSave, onClose } = renderModal();

  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onSave).not.toHaveBeenCalled();
});

test("is empty when adding and prefilled when editing", () => {
  const { unmount } = render(
    <ArtPieceModal onSave={() => {}} onClose={() => {}} />
  );
  expect(screen.getByLabelText("Name")).toHaveValue("");
  expect(
    screen.getByRole("heading", { name: "Add art piece" })
  ).toBeInTheDocument();
  unmount();

  render(<ArtPieceModal piece={piece} onSave={() => {}} onClose={() => {}} />);

  expect(screen.getByLabelText("Image URL")).toHaveValue(piece.imageSource);
  expect(screen.getByLabelText("Name")).toHaveValue(piece.name);
  expect(screen.getByLabelText("Artist")).toHaveValue(piece.artist);
  expect(screen.getByLabelText("Genre")).toHaveValue(piece.genre);
  expect(screen.getByLabelText("Year")).toHaveValue(piece.year);
  expect(
    screen.getByRole("heading", { name: "Edit art piece" })
  ).toBeInTheDocument();
});

test("applies the same validation when editing", async () => {
  const { onSave } = renderModal({ piece });

  await fillIn({ Artist: "" });
  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  expect(onSave).not.toHaveBeenCalled();
  expect(screen.getByText("Artist is required.")).toBeInTheDocument();
});
