import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    year: "1955",
    genre: "Abstract Expressionism",
  },
  {
    slug: "wheat-field",
    artist: "Vincent van Gogh",
    name: "Wheat Field",
    imageSource: "https://example.com/wheat.jpg",
    year: "1888",
    genre: "Post-Impressionism",
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

test("shows the spotlight after clicking Spotlight", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => [pieces[0]] })
  );
  renderApp("/art-pieces");
  await screen.findByRole("list");

  await userEvent.click(screen.getByRole("link", { name: "Spotlight" }));

  expect(
    await screen.findByRole("img", { name: pieces[0].name })
  ).toBeInTheDocument();
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
});

test("shows the gallery after clicking Gallery", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );
  renderApp("/");
  await screen.findByRole("img", { name: /./ });

  await userEvent.click(screen.getByRole("link", { name: "Gallery" }));

  expect(await screen.findByRole("list")).toBeInTheDocument();
});

test("shows Page not found on unknown URLs", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );

  renderApp("/unknown");

  expect(await screen.findByText("Page not found")).toBeInTheDocument();
});

test.each(["/", "/art-pieces", "/unknown"])(
  "shows the navigation once on %s",
  (route) => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    renderApp(route);

    expect(screen.getAllByRole("navigation")).toHaveLength(1);
  }
);

test("shows the details on /art-pieces/:slug", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );

  renderApp("/art-pieces/wheat-field");

  expect(
    await screen.findByRole("heading", { name: "Wheat Field" })
  ).toBeInTheDocument();
  expect(screen.getByText(/Vincent van Gogh/)).toBeInTheDocument();
  expect(screen.getByText(/1888/)).toBeInTheDocument();
  expect(screen.getByText(/Post-Impressionism/)).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Orange Red and Green" })
  ).not.toBeInTheDocument();
});

test("shows the details after clicking a piece in the list", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );
  renderApp("/art-pieces");

  await userEvent.click(
    await screen.findByRole("link", { name: /Wheat Field/ })
  );

  expect(
    await screen.findByRole("heading", { name: "Wheat Field" })
  ).toBeInTheDocument();
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
});

test("goes back to the list after clicking Back", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );
  renderApp("/art-pieces/wheat-field");

  await userEvent.click(await screen.findByRole("link", { name: "Back" }));

  expect(await screen.findByRole("list")).toBeInTheDocument();
});

test("shows Art piece not found for an unknown slug", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );

  renderApp("/art-pieces/nope");

  expect(await screen.findByText("Art piece not found")).toBeInTheDocument();
  expect(screen.getByRole("navigation")).toBeInTheDocument();
});

test("marks a piece as favorite from the gallery", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );
  renderApp("/art-pieces");

  const [button] = await screen.findAllByRole("button", {
    name: "Add to favorites",
  });
  await userEvent.click(button);

  expect(
    screen.getByRole("button", { name: "Remove from favorites" })
  ).toHaveAttribute("aria-pressed", "true");
});

test("removes a piece from favorites", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );
  renderApp("/art-pieces");

  const [button] = await screen.findAllByRole("button", {
    name: "Add to favorites",
  });
  await userEvent.click(button);
  await userEvent.click(
    screen.getByRole("button", { name: "Remove from favorites" })
  );

  expect(
    screen.queryByRole("button", { name: "Remove from favorites" })
  ).not.toBeInTheDocument();
  expect(
    screen.getAllByRole("button", { name: "Add to favorites" })
  ).toHaveLength(pieces.length);
});

test("favoriting one piece leaves the others unchanged", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );
  renderApp("/art-pieces");

  const [button] = await screen.findAllByRole("button", {
    name: "Add to favorites",
  });
  await userEvent.click(button);

  expect(
    screen.getAllByRole("button", { name: "Remove from favorites" })
  ).toHaveLength(1);
  expect(
    screen.getAllByRole("button", { name: "Add to favorites" })
  ).toHaveLength(pieces.length - 1);
});

test("keeps the favorite status between gallery and details", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );
  renderApp("/art-pieces");

  const [button] = await screen.findAllByRole("button", {
    name: "Add to favorites",
  });
  await userEvent.click(button);
  await userEvent.click(
    screen.getByRole("link", { name: /Orange Red and Green/ })
  );

  const onDetails = await screen.findByRole("button", {
    name: "Remove from favorites",
  });
  expect(onDetails).toHaveAttribute("aria-pressed", "true");

  await userEvent.click(onDetails);
  await userEvent.click(screen.getByRole("link", { name: "Back" }));

  expect(
    await screen.findAllByRole("button", { name: "Add to favorites" })
  ).toHaveLength(pieces.length);
});

test("shows the favorite status on the spotlight", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => [pieces[0]] })
  );
  renderApp("/");

  await userEvent.click(
    await screen.findByRole("button", { name: "Add to favorites" })
  );

  expect(
    screen.getByRole("button", { name: "Remove from favorites" })
  ).toHaveAttribute("aria-pressed", "true");
});

test("shows the favorites page after clicking Favorites", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );
  renderApp("/art-pieces");
  await screen.findByRole("list");

  await userEvent.click(screen.getByRole("link", { name: "Favorites" }));

  expect(await screen.findByRole("list")).toBeInTheDocument();
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  expect(screen.queryByText("Page not found")).not.toBeInTheDocument();
});

test("lists only favorite art pieces on /favorites", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );
  renderApp("/art-pieces");
  const [button] = await screen.findAllByRole("button", {
    name: "Add to favorites",
  });
  await userEvent.click(button);

  await userEvent.click(screen.getByRole("link", { name: "Favorites" }));

  expect(
    await screen.findByRole("img", { name: pieces[0].name })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("img", { name: pieces[1].name })
  ).not.toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
});

test("shows image, title and artist of favorites", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );
  renderApp("/art-pieces");
  const [button] = await screen.findAllByRole("button", {
    name: "Add to favorites",
  });
  await userEvent.click(button);

  await userEvent.click(screen.getByRole("link", { name: "Favorites" }));

  expect(
    await screen.findByRole("img", { name: pieces[0].name })
  ).toHaveAttribute("src", pieces[0].imageSource);
  expect(screen.getByText(/Orange Red and Green/)).toBeInTheDocument();
  expect(screen.getByText(/Ad Reinhardt/)).toBeInTheDocument();
});

test("shows an active favorite button for each favorite", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );
  renderApp("/art-pieces");
  for (const button of await screen.findAllByRole("button", {
    name: "Add to favorites",
  })) {
    await userEvent.click(button);
  }

  await userEvent.click(screen.getByRole("link", { name: "Favorites" }));

  const buttons = await screen.findAllByRole("button", {
    name: "Remove from favorites",
  });
  expect(buttons).toHaveLength(pieces.length);
  for (const button of buttons) {
    expect(button).toHaveAttribute("aria-pressed", "true");
  }
});
