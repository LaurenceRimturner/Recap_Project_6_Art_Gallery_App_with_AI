export function pickRandom<T>(items: T[]): T | undefined {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return items[Math.floor((value / 2 ** 32) * items.length)];
}
