type ColorPaletteProps = {
  colors: string[];
};

export default function ColorPalette({ colors }: ColorPaletteProps) {
  if (colors.length === 0) return null;

  return (
    <section className="color-palette">
      <h3>Colors</h3>
      <ul className="palette">
        {colors.map((color, index) => (
          <li key={`${color}-${index}`}>
            <span
              className="swatch"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            {color}
          </li>
        ))}
      </ul>
    </section>
  );
}
