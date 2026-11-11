import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Draggable } from "gsap/Draggable";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router";

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

test("shows an Added by you badge only for custom pieces", () => {
  const { unmount } = render(
    <Spotlight
      pieces={[{ ...pieces[0], isCustom: true }]}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );
  expect(screen.getByText("Added by you")).toBeInTheDocument();
  unmount();

  render(
    <Spotlight
      pieces={[pieces[0]]}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: MemoryRouter }
  );
  expect(screen.queryByText("Added by you")).not.toBeInTheDocument();
});

function WithDetailsRoute({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <main>
        <Routes>
          <Route path="/" element={children} />
          <Route path="/art-pieces/:slug" element={<p>Details page</p>} />
        </Routes>
      </main>
    </MemoryRouter>
  );
}

function renderDraggable(
  props: {
    position?: { x: number; y: number };
    onPositionChange?: (position: { x: number; y: number }) => void;
  } = {}
) {
  const create = vi
    .spyOn(Draggable, "create")
    .mockReturnValue([] as unknown as Draggable[]);
  const view = render(
    <Spotlight
      pieces={[pieces[0]]}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
      {...props}
    />,
    { wrapper: WithDetailsRoute }
  );
  const vars = create.mock.calls[0]?.[1] as Draggable.Vars;
  return { ...view, create, vars };
}

test("makes the spotlight draggable by its figure", () => {
  const { container, create, vars } = renderDraggable();

  expect(create).toHaveBeenCalledTimes(1);
  expect(create.mock.calls[0][0]).toBe(container.querySelector(".spotlight"));
  expect(vars.type).toBe("x,y");
  expect(vars.trigger).toBe(screen.getByRole("figure"));
});

test("reports the position when a drag ends", () => {
  const onPositionChange = vi.fn();
  const { vars } = renderDraggable({ onPositionChange });

  vars.onDragEnd?.call({ x: 40, y: 12 } as Draggable);

  expect(onPositionChange).toHaveBeenCalledWith({ x: 40, y: 12 });
});

test("starts at the given position", () => {
  const { container } = renderDraggable({ position: { x: 40, y: 12 } });

  expect(container.querySelector(".spotlight")).toHaveStyle({
    transform: "translate(40px, 12px)",
  });
});

test("limits dragging to the page so the piece is not moved on load", () => {
  const { vars } = renderDraggable();

  expect(vars.bounds).toBe(document.querySelector("main"));
});

test("opens the details page on a plain click", () => {
  renderDraggable();

  fireEvent.click(screen.getByRole("link"));

  expect(screen.getByText("Details page")).toBeInTheDocument();
});

test("does not open the details page after a drag", () => {
  const { vars } = renderDraggable();
  const link = screen.getByRole("link");

  vars.onDragStart?.call({} as Draggable, new Event("pointerdown"));
  fireEvent.click(link);

  expect(screen.queryByText("Details page")).not.toBeInTheDocument();

  fireEvent.click(link);

  expect(screen.getByText("Details page")).toBeInTheDocument();
});

test("opens the details page on a tap after a drag that ended without a click", () => {
  const { vars } = renderDraggable();

  vars.onDragStart?.call({} as Draggable, new Event("pointerdown"));
  vars.onPress?.call({} as Draggable, new Event("pointerdown"));
  fireEvent.click(screen.getByRole("link"));

  expect(screen.getByText("Details page")).toBeInTheDocument();
});

test("throws the piece onward and keeps the final position", () => {
  const onPositionChange = vi.fn();
  const { vars } = renderDraggable({ onPositionChange });

  expect(vars.inertia).toBe(true);

  vars.onThrowComplete?.call({ x: 80, y: 20 } as Draggable);

  expect(onPositionChange).toHaveBeenCalledWith({ x: 80, y: 20 });
});

test("marks the piece while it is pressed", () => {
  const { container, vars } = renderDraggable();
  const piece = container.querySelector(".spotlight");

  vars.onPress?.call({} as Draggable, new Event("pointerdown"));
  expect(piece).toHaveClass("is-dragging");

  vars.onRelease?.call(
    { isThrowing: false } as Draggable,
    new Event("pointerup")
  );
  expect(piece).not.toHaveClass("is-dragging");
});

test("keeps the mark while the piece is still being thrown", () => {
  const { container, vars } = renderDraggable();
  const piece = container.querySelector(".spotlight");

  vars.onPress?.call({} as Draggable, new Event("pointerdown"));
  vars.onRelease?.call(
    { isThrowing: true } as Draggable,
    new Event("pointerup")
  );
  expect(piece).toHaveClass("is-dragging");

  vars.onThrowComplete?.call({ x: 0, y: 0 } as Draggable);
  expect(piece).not.toHaveClass("is-dragging");
});

test("takes the glow colors from the colors of the piece", () => {
  const { container } = renderDraggable();

  const piece = container.querySelector<HTMLElement>(".spotlight");
  expect(piece?.style.getPropertyValue("--glow-a")).toBe(pieces[0].colors[0]);
  expect(piece?.style.getPropertyValue("--glow-b")).toBe(pieces[0].colors[1]);
});

test("uses one color for both glow layers when the piece has a single color", () => {
  vi.spyOn(Draggable, "create").mockReturnValue([] as unknown as Draggable[]);
  const { container } = render(
    <Spotlight
      pieces={[{ ...pieces[0], colors: ["#123456"] }]}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: WithDetailsRoute }
  );

  const piece = container.querySelector<HTMLElement>(".spotlight");
  expect(piece?.style.getPropertyValue("--glow-a")).toBe("#123456");
  expect(piece?.style.getPropertyValue("--glow-b")).toBe("#123456");
});

test("sets no glow colors for a piece without colors, so the accent is used", () => {
  vi.spyOn(Draggable, "create").mockReturnValue([] as unknown as Draggable[]);
  const { container } = render(
    <Spotlight
      pieces={[{ ...pieces[0], colors: [] }]}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: WithDetailsRoute }
  );

  const piece = container.querySelector<HTMLElement>(".spotlight");
  expect(piece?.style.getPropertyValue("--glow-a")).toBe("");
  expect(piece?.style.getPropertyValue("--glow-b")).toBe("");
});

test("works with the real Draggable and InertiaPlugin", () => {
  render(
    <Spotlight
      pieces={[pieces[0]]}
      isFavorite={() => false}
      onToggleFavorite={() => {}}
    />,
    { wrapper: WithDetailsRoute }
  );

  const piece = document.querySelector<HTMLElement>(".spotlight");
  expect(piece).not.toBeNull();
  expect(Draggable.get(piece as HTMLElement)).toBeTruthy();
});
