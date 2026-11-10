import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ArtPieceComment } from "../types";
import Comments from "./Comments";

const comments: ArtPieceComment[] = [
  { text: "Second thoughts", date: "2025-03-02T14:30:00.000Z" },
  { text: "First impression", date: "2025-03-01T09:15:00.000Z" },
];

test("shows a Comments heading", () => {
  render(
    <Comments
      comments={comments}
      onEditComment={() => {}}
      onDeleteComment={() => {}}
    />
  );

  expect(screen.getByRole("heading", { name: "Comments" })).toBeInTheDocument();
});

test("shows a list with one item per comment", () => {
  render(
    <Comments
      comments={comments}
      onEditComment={() => {}}
      onDeleteComment={() => {}}
    />
  );

  expect(screen.getAllByRole("listitem")).toHaveLength(comments.length);
});

test("shows each comment's text", () => {
  render(
    <Comments
      comments={comments}
      onEditComment={() => {}}
      onDeleteComment={() => {}}
    />
  );

  expect(screen.getByText("Second thoughts")).toBeInTheDocument();
  expect(screen.getByText("First impression")).toBeInTheDocument();
});

test("shows each comment's date and time", () => {
  render(
    <Comments
      comments={comments}
      onEditComment={() => {}}
      onDeleteComment={() => {}}
    />
  );

  comments.forEach((comment) => {
    expect(
      screen.getByText(new Date(comment.date).toLocaleString())
    ).toBeInTheDocument();
  });
});

test("shows the comments in the given order", () => {
  render(
    <Comments
      comments={comments}
      onEditComment={() => {}}
      onDeleteComment={() => {}}
    />
  );

  const items = screen.getAllByRole("listitem");

  expect(within(items[0]).getByText("Second thoughts")).toBeInTheDocument();
  expect(within(items[1]).getByText("First impression")).toBeInTheDocument();
});

function renderComments(
  handlers: {
    onEditComment?: (date: string, text: string) => void;
    onDeleteComment?: (date: string) => void;
  } = {}
) {
  return render(
    <Comments
      comments={comments}
      onEditComment={handlers.onEditComment ?? (() => {})}
      onDeleteComment={handlers.onDeleteComment ?? (() => {})}
    />
  );
}

function itemOf(text: string) {
  return screen.getByText(text).closest("li") as HTMLElement;
}

test("shows an Edit and a Delete button on each comment", () => {
  renderComments();

  expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(2);
  expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(2);
});

test("turns the comment into a prefilled field when Edit is clicked", async () => {
  renderComments();
  const item = itemOf("First impression");

  await userEvent.click(within(item).getByRole("button", { name: "Edit" }));

  expect(within(item).getByRole("textbox")).toHaveValue("First impression");
});

test("saves the edited text", async () => {
  const onEditComment = vi.fn();
  renderComments({ onEditComment });

  await userEvent.click(
    within(itemOf("First impression")).getByRole("button", { name: "Edit" })
  );
  const field = screen.getByRole("textbox");
  await userEvent.clear(field);
  await userEvent.type(field, "Changed my mind");
  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  expect(onEditComment).toHaveBeenCalledWith(
    "2025-03-01T09:15:00.000Z",
    "Changed my mind"
  );
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
});

test("keeps the original text when editing is cancelled", async () => {
  const onEditComment = vi.fn();
  renderComments({ onEditComment });

  await userEvent.click(
    within(itemOf("First impression")).getByRole("button", { name: "Edit" })
  );
  await userEvent.type(screen.getByRole("textbox"), " extra");
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

  expect(onEditComment).not.toHaveBeenCalled();
  expect(screen.getByText("First impression")).toBeInTheDocument();
});

test("does not save an empty or whitespace-only edit", async () => {
  const onEditComment = vi.fn();
  renderComments({ onEditComment });

  await userEvent.click(
    within(itemOf("First impression")).getByRole("button", { name: "Edit" })
  );
  const field = screen.getByRole("textbox");
  await userEvent.clear(field);
  await userEvent.type(field, "   ");
  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  expect(onEditComment).not.toHaveBeenCalled();
  expect(screen.getByRole("textbox")).toBeInTheDocument();
});

test("asks for confirmation before deleting and deletes on confirm", async () => {
  const onDeleteComment = vi.fn();
  renderComments({ onDeleteComment });

  await userEvent.click(
    within(itemOf("First impression")).getByRole("button", { name: "Delete" })
  );

  expect(onDeleteComment).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Confirm delete" }));

  expect(onDeleteComment).toHaveBeenCalledWith("2025-03-01T09:15:00.000Z");
});

test("keeps the comment when the deletion is cancelled", async () => {
  const onDeleteComment = vi.fn();
  renderComments({ onDeleteComment });

  await userEvent.click(
    within(itemOf("First impression")).getByRole("button", { name: "Delete" })
  );
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

  expect(onDeleteComment).not.toHaveBeenCalled();
  expect(
    screen.queryByRole("button", { name: "Confirm delete" })
  ).not.toBeInTheDocument();
});

test("fades in only comments added after the first render", () => {
  const props = {
    onEditComment: () => {},
    onDeleteComment: () => {},
  };
  const { rerender } = render(<Comments comments={comments} {...props} />);

  expect(itemOf("Second thoughts")).not.toHaveClass("fade-in");

  rerender(
    <Comments
      comments={[
        { text: "Brand new", date: "2025-03-03T10:00:00.000Z" },
        ...comments,
      ]}
      {...props}
    />
  );

  expect(itemOf("Brand new")).toHaveClass("fade-in");
  expect(itemOf("Second thoughts")).not.toHaveClass("fade-in");
  expect(itemOf("First impression")).not.toHaveClass("fade-in");
});
