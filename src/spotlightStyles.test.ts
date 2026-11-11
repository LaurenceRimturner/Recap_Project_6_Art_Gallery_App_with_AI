import css from "./styles.css?raw";

// jsdom has no rendering, so these guard the glow rules in the CSS

test("defines the glow from the colors of the piece with the accent as fallback", () => {
  const rule = /\.spotlight\s*\{([^}]*--glow-shadow:[^}]*)\}/.exec(css)?.[1];

  expect(rule).toMatch(/var\(--glow-a, var\(--accent\)\)/);
  expect(rule).toMatch(/var\(--glow-b, var\(--accent\)\)/);
});

test("glows while the piece is dragged", () => {
  expect(css).toMatch(
    /\.spotlight\.is-dragging img\s*\{[^}]*box-shadow:\s*var\(--glow-shadow\)/
  );
});

test("glows on hover only where hovering exists, so touch screens do not keep it", () => {
  expect(css).toMatch(
    /@media \(hover: hover\)\s*\{\s*\.spotlight figure:hover img\s*\{[^}]*box-shadow:\s*var\(--glow-shadow\)/
  );
});

test("keeps the opacity fade next to the glow transition on the image", () => {
  const rule = /\.spotlight img\s*\{[^}]*transition:([^;]*);/.exec(css)?.[1];

  expect(rule).toMatch(/opacity/);
  expect(rule).toMatch(/box-shadow/);
});
