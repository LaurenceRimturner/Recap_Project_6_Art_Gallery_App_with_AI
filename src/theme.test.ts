import { getInitialTheme, isTheme, THEME_STORAGE_KEY } from "./theme";

function stubSystemTheme(prefersDark: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)" && prefersDark,
    }))
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("recognises only light and dark as themes", () => {
  expect(isTheme("light")).toBe(true);
  expect(isTheme("dark")).toBe(true);
  expect(isTheme("purple")).toBe(false);
  expect(isTheme(null)).toBe(false);
});

test("uses the system preference without a stored theme", () => {
  stubSystemTheme(true);
  expect(getInitialTheme()).toBe("dark");

  stubSystemTheme(false);
  expect(getInitialTheme()).toBe("light");
});

test("uses light when matchMedia is not available", () => {
  vi.stubGlobal("matchMedia", undefined);

  expect(getInitialTheme()).toBe("light");
});

test("prefers a stored theme over the system preference", () => {
  stubSystemTheme(true);
  localStorage.setItem(THEME_STORAGE_KEY, "light");

  expect(getInitialTheme()).toBe("light");
});

test("ignores invalid stored values", () => {
  stubSystemTheme(true);

  for (const value of ["purple", "{oops", ""]) {
    localStorage.setItem(THEME_STORAGE_KEY, value);
    expect(getInitialTheme()).toBe("dark");
  }
});

test("falls back to the system preference when localStorage throws", () => {
  stubSystemTheme(true);
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });

  expect(getInitialTheme()).toBe("dark");
});
