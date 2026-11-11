import html from "../index.html?raw";

const inlineScript = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? "";

// scripts run in the jsdom window, which is not the object the tests see as
// `window`, so the system preference is stubbed by a script as well
function runScript(code: string) {
  const script = document.createElement("script");
  script.textContent = code;
  document.head.append(script);
  script.remove();
}

function stubSystemTheme(prefersDark: boolean) {
  runScript(
    `window.matchMedia = (query) => ({ matches: query === "(prefers-color-scheme: dark)" && ${prefersDark} });`
  );
}

afterEach(() => {
  runScript("delete window.matchMedia;");
  document.documentElement.removeAttribute("data-theme");
});

test("runs before the app bundle", () => {
  const inlineAt = html.indexOf("<script>");
  const moduleAt = html.indexOf('<script type="module"');

  expect(inlineAt).toBeGreaterThan(-1);
  expect(inlineAt).toBeLessThan(moduleAt);
});

test("sets the stored theme", () => {
  stubSystemTheme(false);
  localStorage.setItem("theme", "dark");

  runScript(inlineScript);

  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
});

test("sets the system theme without a stored one", () => {
  stubSystemTheme(true);

  runScript(inlineScript);

  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
});

test("falls back to light for invalid stored data", () => {
  stubSystemTheme(false);
  localStorage.setItem("theme", "purple");

  runScript(inlineScript);

  expect(document.documentElement).toHaveAttribute("data-theme", "light");
});
