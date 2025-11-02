export const zip = <T, U>(arr1: T[], arr2: U[]): [T, U][] => {
  const length = Math.min(arr1.length, arr2.length);
  // biome-ignore lint/style/noNonNullAssertion: <lengthが同じ前提>
  return Array.from({ length }, (_, i) => [arr1[i]!, arr2[i]!]);
};
