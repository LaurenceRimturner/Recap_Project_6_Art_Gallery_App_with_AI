import css from "./styles.css?raw";

type Rgb = [number, number, number];

function tokenBlock(selector: string) {
  const start = css.indexOf(`${selector} {`);
  return css.slice(start, css.indexOf("}", start));
}

function token(block: string, name: string): Rgb {
  const match = new RegExp(
    String.raw`--${name}:\s*rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)`
  ).exec(block);
  if (!match) throw new Error(`--${name} not found`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

// mixes `share` of a into b, like color-mix(in srgb, a share%, b)
function mix(a: Rgb, b: Rgb, share: number): Rgb {
  return a.map((value, i) =>
    Math.round(value * share + b[i] * (1 - share))
  ) as Rgb;
}

function luminance(color: Rgb) {
  const [r, g, b] = color.map((value) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Rgb, b: Rgb) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

function readMuteShare(block: string) {
  const match = /--muted:\s*color-mix\(in srgb, var\(--ink\) (\d+)%/.exec(
    block
  );
  return match ? Number(match[1]) / 100 : 0;
}

const themes = [
  { name: "light", selector: ":root" },
  { name: "dark", selector: ':root[data-theme="dark"]' },
];

describe.each(themes)("$name theme", ({ selector }) => {
  const light = tokenBlock(":root");
  const block = tokenBlock(selector);
  const ink = token(block, "ink");
  const paper = token(block, "paper");
  const accent = token(block, "accent");
  const muteShare = readMuteShare(block) || readMuteShare(light);
  const muted = mix(ink, paper, muteShare);
  // the comment section background: color-mix(ink 6%, paper)
  const tint = mix(ink, paper, 0.06);

  test("ink text is readable on paper and on the comment tint", () => {
    expect(contrast(ink, paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(ink, tint)).toBeGreaterThanOrEqual(4.5);
  });

  test("muted text is readable on paper and on the comment tint", () => {
    expect(contrast(muted, paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(muted, tint)).toBeGreaterThanOrEqual(4.5);
  });

  test("accent text is readable on paper and on the comment tint", () => {
    expect(contrast(accent, paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(accent, tint)).toBeGreaterThanOrEqual(4.5);
  });

  test("paper text is readable on the accent", () => {
    expect(contrast(paper, accent)).toBeGreaterThanOrEqual(4.5);
  });

  test("ink borders are visible on paper", () => {
    expect(contrast(ink, paper)).toBeGreaterThanOrEqual(3);
  });
});

test("the dark theme is its own palette, not a swap of the light one", () => {
  const light = tokenBlock(":root");
  const dark = tokenBlock(':root[data-theme="dark"]');

  expect(token(dark, "ink")).not.toEqual(token(light, "paper"));
  expect(token(dark, "paper")).not.toEqual(token(light, "ink"));
  expect(token(dark, "accent")).not.toEqual(token(light, "accent"));
});
