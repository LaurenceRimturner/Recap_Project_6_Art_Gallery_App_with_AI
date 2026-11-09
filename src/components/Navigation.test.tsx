import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import Navigation from "./Navigation";

function renderNavigation(route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Navigation />
    </MemoryRouter>
  );
}

test("shows a Spotlight link", () => {
  renderNavigation();

  expect(screen.getByRole("link", { name: "Spotlight" })).toHaveAttribute(
    "href",
    "/"
  );
});

test("shows a Gallery link", () => {
  renderNavigation();

  expect(screen.getByRole("link", { name: "Gallery" })).toHaveAttribute(
    "href",
    "/art-pieces"
  );
});

test("shows a Favorites link", () => {
  renderNavigation();

  expect(screen.getByRole("link", { name: "Favorites" })).toHaveAttribute(
    "href",
    "/favorites"
  );
});

test("highlights the Spotlight link on /", () => {
  renderNavigation("/");

  expect(screen.getByRole("link", { name: "Spotlight" })).toHaveClass("active");
  expect(screen.getByRole("link", { name: "Gallery" })).not.toHaveClass(
    "active"
  );
});

test("highlights the Gallery link on /art-pieces", () => {
  renderNavigation("/art-pieces");

  expect(screen.getByRole("link", { name: "Gallery" })).toHaveClass("active");
  expect(screen.getByRole("link", { name: "Spotlight" })).not.toHaveClass(
    "active"
  );
});

test("highlights the Favorites link on /favorites", () => {
  renderNavigation("/favorites");

  expect(screen.getByRole("link", { name: "Favorites" })).toHaveClass("active");
  expect(screen.getByRole("link", { name: "Gallery" })).not.toHaveClass(
    "active"
  );
});

test("shows exactly three links inside the navigation", () => {
  renderNavigation();

  const nav = screen.getByRole("navigation");
  expect(within(nav).getAllByRole("link")).toHaveLength(3);
});
