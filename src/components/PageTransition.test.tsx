import { render, screen, waitFor } from "@testing-library/react";

import PageTransition from "./PageTransition";

test("fades the content in", async () => {
  render(
    <PageTransition animate>
      <p>Content</p>
    </PageTransition>
  );

  const page = screen.getByText("Content").parentElement;
  expect(page).toHaveStyle({ opacity: "0" });

  await waitFor(() => expect(page?.style.opacity).toBe(""));
});

test("does not fade the content in when animate is off", () => {
  render(
    <PageTransition animate={false}>
      <p>Content</p>
    </PageTransition>
  );

  expect(screen.getByText("Content").parentElement?.style.opacity).toBe("");
});
