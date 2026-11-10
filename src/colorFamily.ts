export type ColorFamily =
  "red" | "yellow" | "green" | "blue" | "purple" | "pink" | "neutral" | "grey";

const MIN_SATURATION = 0.15;
const MIN_LIGHTNESS = 0.08;
const MAX_LIGHTNESS = 0.95;

// muted orange/yellow hues are beige-ish and count as neutral
const BEIGE_MIN_HUE = 20;
const BEIGE_MAX_HUE = 70;
const BEIGE_MAX_SATURATION = 0.5;

const HUE_FAMILIES: [upTo: number, family: ColorFamily][] = [
  [20, "red"],
  [70, "yellow"],
  [170, "green"],
  [260, "blue"],
  [315, "purple"],
  [345, "pink"],
];

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function hexToHsl(hex: string) {
  const [r, g, b] = [1, 3, 5].map(
    (start) => parseInt(hex.slice(start, start + 2), 16) / 255
  );
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
  }

  return { hue: (hue * 60 + 360) % 360, saturation, lightness };
}

export function colorFamily(hex: string): ColorFamily {
  if (!HEX_COLOR.test(hex)) return "grey";

  const { hue, saturation, lightness } = hexToHsl(hex);
  if (
    saturation < MIN_SATURATION ||
    lightness < MIN_LIGHTNESS ||
    lightness > MAX_LIGHTNESS
  ) {
    return "grey";
  }
  if (
    hue >= BEIGE_MIN_HUE &&
    hue < BEIGE_MAX_HUE &&
    saturation < BEIGE_MAX_SATURATION
  ) {
    return "neutral";
  }

  return HUE_FAMILIES.find(([upTo]) => hue < upTo)?.[1] ?? "red";
}
