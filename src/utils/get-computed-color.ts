/**
 * 複数のCSS変数を一度に取得する関数
 * @param variableNames 取得するCSS変数名の配列
 * @returns キーが変数名、値がCSS変数値のオブジェクト
 */
const getMultipleCSSVariables = (variableNames: string[]): Record<string, string> => {
  const computedStyle = getComputedStyle(document.documentElement);
  const result: Record<string, string> = {};

  for (const name of variableNames) {
    const cssVar = name.startsWith("--") ? name : `--${name}`;
    result[name] = computedStyle.getPropertyValue(cssVar).trim();
  }

  return result;
};

/**
 * TailwindCSSの全ての利用可能なCSS変数を取得する関数
 * @returns 全てのCSS変数のオブジェクト
 */
const getAllTailwindVariables = (): Record<string, string> => {
  const computedStyle = getComputedStyle(document.documentElement);
  const result: Record<string, string> = {};

  // CSS変数を全て取得
  for (let i = 0; i < computedStyle.length; i++) {
    const property = computedStyle.item(i);
    if (property.startsWith("--")) {
      result[property] = computedStyle.getPropertyValue(property).trim();
    }
  }

  return result;
};

// 後方互換性のため元の関数名も残す
const getComputedColors = () => {
  return getAllTailwindVariables();
};

export {
  getComputedColors, // 後方互換性
  getMultipleCSSVariables,
};
