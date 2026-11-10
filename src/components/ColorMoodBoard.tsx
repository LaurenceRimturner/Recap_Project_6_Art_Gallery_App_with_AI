import { type ColorFamily, colorFamily } from "../colorFamily";

type ColorMoodBoardProps = {
  colors: string[];
  selected: ColorFamily | null;
  onToggle: (family: ColorFamily) => void;
};

// The order of the chips. Grey has no chip.
const FAMILIES: ColorFamily[] = [
  "red",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
];

export default function ColorMoodBoard({
  colors,
  selected,
  onToggle,
}: ColorMoodBoardProps) {
  // For every family, find one example color from the gallery.
  // No example means the family is not in the gallery, so it gets no chip.
  const chips = [];
  for (const family of FAMILIES) {
    const example = colors.find((color) => colorFamily(color) === family);
    if (example) chips.push({ family, example });
  }

  return (
    <div className="mood-board" role="group" aria-label="Colors">
      {chips.map(({ family, example }) => (
        <button
          key={family}
          type="button"
          aria-pressed={selected === family}
          onClick={() => onToggle(family)}
        >
          <span
            className="dot"
            aria-hidden="true"
            style={{ backgroundColor: example }}
          />
          {family}
        </button>
      ))}
    </div>
  );
}
