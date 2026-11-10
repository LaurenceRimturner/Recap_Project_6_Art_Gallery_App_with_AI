import { colorFamily } from "./colorFamily";

test.each([
  ["#D32F2F", "red"],
  ["#E8C547", "yellow"],
  ["#2E7D32", "green"],
  ["#1F3A93", "blue"],
  ["#7B3FA0", "purple"],
  ["#E91E8C", "pink"],
])("maps %s to %s", (hex, family) => {
  expect(colorFamily(hex)).toBe(family);
});

test.each(["#D9C9A8", "#C2B280", "#FF7F00", "#FFB300", "#E8C547"])(
  "maps the beige, orange or yellow color %s to yellow",
  (hex) => {
    expect(colorFamily(hex)).toBe("yellow");
  }
);

test.each(["#000000", "#FFFFFF", "#808080", "#F5F5F2"])(
  "maps the low-saturation color %s to grey",
  (hex) => {
    expect(colorFamily(hex)).toBe("grey");
  }
);

test("keeps strong reds out of the yellow range", () => {
  expect(colorFamily("#FF4D00")).toBe("red");
});

test("groups similar hues into the same family", () => {
  expect(colorFamily("#C62828")).toBe(colorFamily("#EF5350"));
  expect(colorFamily("#1F3A93")).toBe(colorFamily("#4B6A88"));
});

test("is case-insensitive", () => {
  expect(colorFamily("#d32f2f")).toBe(colorFamily("#D32F2F"));
});

test("starts the yellow range exactly at 20 degrees", () => {
  expect(colorFamily("#FF5500")).toBe("yellow");
});

test.each(["#FFF", "D32F2F", "not a color", ""])(
  "treats the unparsable value %j as grey",
  (value) => {
    expect(colorFamily(value)).toBe("grey");
  }
);
