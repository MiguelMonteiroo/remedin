import { isLargeText } from "../accessibilityLayout";

const cases: Array<[number, boolean]> = [
  [1, false],
  [1.15, false],
  [1.2999999523162842, true],
  [1.3, true],
  [1.5, true],
];

it.each(cases)("uses the accessible layout at scale %s: %s", (scale, expected) => {
  expect(isLargeText(scale)).toBe(expected);
});
