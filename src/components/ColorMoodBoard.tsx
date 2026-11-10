import { type ColorFamily, colorFamily } from "../colorFamily";

type ColorMoodBoardProps = {
  colors: string[];
  selected: ColorFamily | null;
  onToggle: (family: ColorFamily) => void;
};

const FAMILY_ORDER: ColorFamily[] = [
  "neutral",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
];

const MAX_SWATCHES = 6;

export default function ColorMoodBoard({
  colors,
  selected,
  onToggle,
}: ColorMoodBoardProps) {
  const distinctColors = [...new Set(colors)];

  return (
    <div className="mood-board" role="group" aria-label="Colors">
      {FAMILY_ORDER.map((family) => ({
        family,
        swatches: distinctColors.filter(
          (color) => colorFamily(color) === family
        ),
      }))
        .filter(({ swatches }) => swatches.length > 0)
        .map(({ family, swatches }) => (
          <button
            key={family}
            type="button"
            aria-pressed={selected === family}
            onClick={() => onToggle(family)}
          >
            <span className="mood-swatches" aria-hidden="true">
              {swatches.slice(0, MAX_SWATCHES).map((color) => (
                <span
                  key={color}
                  className="swatch"
                  style={{ backgroundColor: color }}
                />
              ))}
            </span>
            {family}
          </button>
        ))}
    </div>
  );
}
