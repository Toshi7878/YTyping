export const zip = <T, U>(arr1: T[], arr2: U[]): [T, U][] => {
  const length = Math.min(arr1.length, arr2.length);
  // biome-ignore lint/style/noNonNullAssertion: <lengthが同じ前提>
  return Array.from({ length }, (_, i) => [arr1[i]!, arr2[i]!]);
};

export function getMinValue(numbers: number[]): number {
  return Math.min(...numbers);
}

export function medianIgnoringZeros(array: number[]) {
  const nonZeroArray = array.filter((a) => a !== 0);

  const temp = [...nonZeroArray].sort((a, b) => a - b);
  const half = (temp.length / 2) | 0;

  if (temp.length % 2) {
    // biome-ignore lint/style/noNonNullAssertion: <>
    return temp[half]!;
  }

  // biome-ignore lint/style/noNonNullAssertion: <>
  return (temp[half - 1]! + temp[half]!) / 2;
}
