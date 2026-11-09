type ColorPaletteProps = {
  colors: string[];
};

export default function ColorPalette({ colors }: ColorPaletteProps) {
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
