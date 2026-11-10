import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CommentForm from "./CommentForm";

test("shows a text field and a submit button", () => {
  render(<CommentForm onAddComment={() => {}} />);

  expect(screen.getByRole("textbox")).toBeRequired();
  expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
});

test("calls onAddComment with the typed text and clears the field", async () => {
  const onAddComment = vi.fn();
  render(<CommentForm onAddComment={onAddComment} />);

  await userEvent.type(screen.getByRole("textbox"), "Lovely colors");
  await userEvent.click(screen.getByRole("button", { name: "Submit" }));

  expect(onAddComment).toHaveBeenCalledTimes(1);
  expect(onAddComment).toHaveBeenCalledWith("Lovely colors");
  expect(screen.getByRole("textbox")).toHaveValue("");
});

test("does not submit an empty comment", async () => {
  const onAddComment = vi.fn();
  render(<CommentForm onAddComment={onAddComment} />);

  await userEvent.click(screen.getByRole("button", { name: "Submit" }));

  expect(onAddComment).not.toHaveBeenCalled();
});

test("does not submit a whitespace-only comment", async () => {
  const onAddComment = vi.fn();
  render(<CommentForm onAddComment={onAddComment} />);

  await userEvent.type(screen.getByRole("textbox"), "   ");
  await userEvent.click(screen.getByRole("button", { name: "Submit" }));

  expect(onAddComment).not.toHaveBeenCalled();
});

test("has a visible label and placeholder on the field", () => {
  render(<CommentForm onAddComment={() => {}} />);

  const field = screen.getByLabelText("Add a comment");

  expect(field).toBe(screen.getByRole("textbox"));
  expect(field).toHaveAttribute("placeholder");
});
