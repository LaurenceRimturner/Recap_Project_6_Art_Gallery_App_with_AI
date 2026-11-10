import { isHttpUrl } from "./isHttpUrl";

test.each(["http://example.com/a.jpg", "https://example.com/a.jpg"])(
  "accepts %s",
  (value) => {
    expect(isHttpUrl(value)).toBe(true);
  }
);

test.each([
  "",
  "not-a-url",
  "ftp://example.com/a.jpg",
  "javascript:alert(1)",
  "data:image/png;base64,AAAA",
])("rejects %s", (value) => {
  expect(isHttpUrl(value)).toBe(false);
});
