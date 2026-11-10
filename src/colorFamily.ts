export type ColorFamily =
  "red" | "yellow" | "green" | "blue" | "purple" | "pink" | "grey";

// A hex color looks like "#D32F2F": a "#" and six characters.
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// The hue is the position on the color wheel (0 to 360 degrees).
// Every hue below the number belongs to the family next to it.
const HUE_FAMILIES: [upTo: number, family: ColorFamily][] = [
  [20, "red"],
  [70, "yellow"],
  [170, "green"],
  [260, "blue"],
  [315, "purple"],
  [345, "pink"],
];

// Turns "#D32F2F" into the three numbers red, green and blue (0 to 1).
function hexToRgb(hex: string) {
  return {
    red: parseInt(hex.slice(1, 3), 16) / 255,
    green: parseInt(hex.slice(3, 5), 16) / 255,
    blue: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

export function colorFamily(hex: string): ColorFamily {
  // Step 1: anything that is not a valid hex color counts as grey.
  if (!HEX_COLOR.test(hex)) return "grey";

  const { red, green, blue } = hexToRgb(hex);
  const strongest = Math.max(red, green, blue);
  const weakest = Math.min(red, green, blue);
  const spread = strongest - weakest;

  // Step 2: how bright and how colorful is it?
  const lightness = (strongest + weakest) / 2;
  const saturation =
    spread === 0 ? 0 : spread / (1 - Math.abs(2 * lightness - 1));

  // Step 3: nearly white, nearly black or washed out means grey.
  if (saturation < 0.15 || lightness < 0.08 || lightness > 0.95) {
    return "grey";
  }

  // Step 4: find the position on the color wheel (the hue).
  let hue = 0;
  if (strongest === red) hue = ((green - blue) / spread) % 6;
  else if (strongest === green) hue = (blue - red) / spread + 2;
  else hue = (red - green) / spread + 4;
  hue = (hue * 60 + 360) % 360;

  // Step 5: take the first family whose hue range contains our hue.
  // A hue of 345 or more is red again, because the wheel is a circle.
  const match = HUE_FAMILIES.find(([upTo]) => hue < upTo);
  return match ? match[1] : "red";
}
