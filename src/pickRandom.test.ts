import { pickRandom } from "./pickRandom";

function stubRandom(fraction: number) {
  return vi
    .spyOn(crypto, "getRandomValues")
    .mockImplementation(<T extends ArrayBufferView>(array: T) => {
      (array as unknown as Uint32Array)[0] = Math.floor(fraction * 2 ** 32);
      return array;
    });
}

afterEach(() => {
  vi.restoreAllMocks();
});

test("returns an element of the array", () => {
  const items = ["a", "b", "c"];

  stubRandom(0);
  expect(pickRandom(items)).toBe("a");

  stubRandom(0.5);
  expect(pickRandom(items)).toBe("b");

  stubRandom(0.999);
  expect(pickRandom(items)).toBe("c");
});

test("stays in range for the maximum random value", () => {
  vi.spyOn(crypto, "getRandomValues").mockImplementation(
    <T extends ArrayBufferView>(array: T) => {
      (array as unknown as Uint32Array)[0] = 2 ** 32 - 1;
      return array;
    }
  );

  expect(pickRandom(["a", "b", "c"])).toBe("c");
});

test("returns undefined for an empty array", () => {
  expect(pickRandom([])).toBeUndefined();
});
