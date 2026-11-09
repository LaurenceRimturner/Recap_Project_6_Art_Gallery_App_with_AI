import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";

import App from "./App";
import type { ArtPiece } from "./types";

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

function renderApp(route: string) {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </SWRConfig>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("shows the list on /art-pieces", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );

  renderApp("/art-pieces");

  for (const piece of pieces) {
    expect(
      await screen.findByRole("img", { name: piece.name })
    ).toBeInTheDocument();
  }
});

test("keeps the heading and shows no loading message on other routes", () => {
  vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

  renderApp("/unknown");

  expect(
    screen.getByRole("heading", { name: "Art Gallery" })
  ).toBeInTheDocument();
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});

test("shows the spotlight on /", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => [pieces[0]] })
  );

  renderApp("/");

  expect(
    await screen.findByRole("img", { name: pieces[0].name })
  ).toHaveAttribute("src", pieces[0].imageSource);
  expect(screen.getByText(/Ad Reinhardt/)).toBeInTheDocument();
});

test("shows no spotlight and no error on / when there are no pieces", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => [] })
  );

  renderApp("/");

  await waitFor(() =>
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
  );
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(
    screen.queryByText("Failed to load art pieces.")
  ).not.toBeInTheDocument();
});

test("shows a loading message on /", () => {
  vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

  renderApp("/");

  expect(screen.getByText("Loading...")).toBeInTheDocument();
});

test("shows an error message on /", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

  renderApp("/");

  expect(
    await screen.findByText("Failed to load art pieces.")
  ).toBeInTheDocument();
});

test("does not show the list on other routes", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );

  renderApp("/");

  await screen.findByRole("heading", { name: "Art Gallery" });
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
});

test("shows a loading message first", () => {
  vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

  renderApp("/art-pieces");

  expect(screen.getByText("Loading...")).toBeInTheDocument();
});

test("shows an error message when loading fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

  renderApp("/art-pieces");

  expect(
    await screen.findByText("Failed to load art pieces.")
  ).toBeInTheDocument();
});
