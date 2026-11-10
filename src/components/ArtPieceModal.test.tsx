import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { imageStub } from "../testImage";
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

test("closes on the native cancel event without saving", () => {
  const { onSave, onClose } = renderModal();

  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { cancelable: true })
  );

  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onSave).not.toHaveBeenCalled();
});

test("moves focus to the first invalid field after a failed save", async () => {
  renderModal();

  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByLabelText("Image URL")).toHaveFocus();

  await fillIn({ ...validValues, Artist: "" });
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByLabelText("Artist")).toHaveFocus();
});

test("returns focus to the element that opened it when unmounted", () => {
  render(<button>Opener</button>);
  const opener = screen.getByRole("button", { name: "Opener" });
  opener.focus();

  const { unmount } = render(
    <ArtPieceModal onSave={() => {}} onClose={() => {}} />
  );
  screen.getByLabelText("Name").focus();
  unmount();

  expect(opener).toHaveFocus();
});

const sizeError = "Image must be between 500 and 2000 pixels wide and tall.";

async function saveWithImage(width: number, height: number) {
  imageStub.width = width;
  imageStub.height = height;
  const handlers = renderModal();
  await fillIn(validValues);
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  return handlers;
}

test.each([
  [499, 1000],
  [1000, 499],
  [2001, 1000],
  [1000, 2001],
])("rejects an image of %i x %i pixels", async (width, height) => {
  const { onSave } = await saveWithImage(width, height);

  expect(onSave).not.toHaveBeenCalled();
  expect(await screen.findByText(sizeError)).toBeInTheDocument();
  expect(screen.getByLabelText("Image URL")).toHaveFocus();
});

test.each([
  [500, 500],
  [2000, 2000],
])("accepts an image of %i x %i pixels", async (width, height) => {
  const { onSave } = await saveWithImage(width, height);

  await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
});

test("rejects an image that cannot be loaded", async () => {
  imageStub.fails = true;
  const { onSave } = renderModal();
  await fillIn(validValues);

  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  expect(onSave).not.toHaveBeenCalled();
  expect(
    await screen.findByText("Image could not be loaded from this URL.")
  ).toBeInTheDocument();
});

test("does not check the image again when editing without changing it", async () => {
  imageStub.fails = true;
  const { onSave } = renderModal({ piece });

  await fillIn({ Name: "Sunset" });
  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
});

test("does not save when the modal is closed while the image is checked", async () => {
  const onSave = vi.fn();
  const { unmount } = render(
    <ArtPieceModal piece={piece} onSave={onSave} onClose={() => {}} />
  );
  await fillIn({ "Image URL": "https://example.com/other.jpg" });

  fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
  unmount();
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(onSave).not.toHaveBeenCalled();
});
