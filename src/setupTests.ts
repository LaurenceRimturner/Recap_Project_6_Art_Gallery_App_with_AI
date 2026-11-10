import "@testing-library/jest-dom/vitest";

// jsdom has no showModal/close; mimic them by toggling the open attribute
HTMLDialogElement.prototype.showModal = function showModal() {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function close() {
  this.removeAttribute("open");
};

afterEach(() => {
  localStorage.clear();
});
