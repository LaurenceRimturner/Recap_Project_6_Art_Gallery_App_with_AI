import { render, screen, within } from "@testing-library/react";

import type { ArtPieceComment } from "../types";
import Comments from "./Comments";

const comments: ArtPieceComment[] = [
  { text: "Second thoughts", date: "2025-03-02T14:30:00.000Z" },
  { text: "First impression", date: "2025-03-01T09:15:00.000Z" },
];

test("shows a Comments heading", () => {
  render(<Comments comments={comments} />);

  expect(screen.getByRole("heading", { name: "Comments" })).toBeInTheDocument();
});

test("shows a list with one item per comment", () => {
  render(<Comments comments={comments} />);

  expect(screen.getAllByRole("listitem")).toHaveLength(comments.length);
});

test("shows each comment's text", () => {
  render(<Comments comments={comments} />);

  expect(screen.getByText("Second thoughts")).toBeInTheDocument();
  expect(screen.getByText("First impression")).toBeInTheDocument();
});

test("shows each comment's date and time", () => {
  render(<Comments comments={comments} />);

  comments.forEach((comment) => {
    expect(
      screen.getByText(new Date(comment.date).toLocaleString())
    ).toBeInTheDocument();
  });
});

test("shows the comments in the given order", () => {
  render(<Comments comments={comments} />);

  const items = screen.getAllByRole("listitem");

  expect(within(items[0]).getByText("Second thoughts")).toBeInTheDocument();
  expect(within(items[1]).getByText("First impression")).toBeInTheDocument();
});
