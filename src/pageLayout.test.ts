import css from "./styles.css?raw";

// jsdom has no layout, so this guards the rule that keeps routes full width
test("children of the page wrapper span the whole main grid like children of main", () => {
  expect(css).toMatch(
    /:where\(\.page > \*\)\s*\{\s*grid-column:\s*1 \/ -1;\s*\}/
  );
});

test("the page wrapper is a subgrid of main", () => {
  expect(css).toMatch(
    /\.page\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*subgrid;\s*\}/
  );
});
