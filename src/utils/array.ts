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

/**
 * ソート済みの数値配列から、指定された値以下で最大の値を効率的に探索します。
 * 見つからない場合は null を返します。
 *
 * @param sortedNumbers 昇順ソート済みの数値配列
 * @param target 基準となる値
 */
export const findClosestLowerOrEqual = (sortedNumbers: number[], target: number): number | null => {
  const first = sortedNumbers[0];
  // 配列が空、または最小値よりtargetが小さい場合は見つからない
  if (first === undefined || first > target) {
    return null;
  }

  // 二分探索で効率化
  let low = 0;
  let high = sortedNumbers.length - 1;
  let resultIndex = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = sortedNumbers[mid];

    // midValがundefinedになることはロジック上ないが型安全のためチェック
    if (midVal === undefined) {
      break;
    }

    if (midVal <= target) {
      resultIndex = mid; // 候補として保持
      low = mid + 1; // より大きな値を探す
    } else {
      high = mid - 1; // 小さな値を探す
    }
  }

  return resultIndex !== -1 ? (sortedNumbers[resultIndex] ?? null) : null;
};
