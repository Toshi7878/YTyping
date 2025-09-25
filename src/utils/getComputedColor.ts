/**
 * TailwindCSSのCSS変数を取得する汎用関数
 * @param variableName CSS変数名（--で始まる形式、またはそれなしの形式）
 * @returns CSS変数の値、見つからない場合は空文字
 */
const getCSSVariable = (variableName: string): string => {
  const computedStyle = getComputedStyle(document.documentElement);

  // 変数名が--で始まっていない場合は追加
  const cssVar = variableName.startsWith("--") ? variableName : `--${variableName}`;

  return computedStyle.getPropertyValue(cssVar).trim();
};

/**
 * TailwindCSSの色変数を取得する関数
 * @param colorName 色名（例: 'primary', 'gray-100', 'blue-500'）
 * @returns 色の値（RGB、HEXなど）
 */
const getTailwindColor = (colorName: string): string => {
  // Tailwindの色変数は通常 --color-{name} の形式
  return getCSSVariable(`--color-${colorName}`);
};

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

/**
 * CSS変数が存在するかチェックする関数
 * @param variableName チェックするCSS変数名
 * @returns 存在する場合はtrue
 */
const hasCSSVariable = (variableName: string): boolean => {
  const cssVar = variableName.startsWith("--") ? variableName : `--${variableName}`;
  const value = getCSSVariable(cssVar);
  return value !== "";
};

// 後方互換性のため元の関数名も残す
const getComputedColors = () => {
  return getAllTailwindVariables();
};

export {
  getAllTailwindVariables,
  getComputedColors, // 後方互換性
  getCSSVariable,
  getMultipleCSSVariables,
  getTailwindColor,
  hasCSSVariable,
};

// デフォルトエクスポート
export default {
  getCSSVariable,
  getTailwindColor,
  getMultipleCSSVariables,
  getAllTailwindVariables,
  hasCSSVariable,
  getComputedColors,
};
