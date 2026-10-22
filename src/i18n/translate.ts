import ja from "./messages/ja.json";

type Values = Record<string, string | number>;
type LooseTranslator = (key: string, values?: Values) => string;

let currentTranslator: LooseTranslator | undefined;
let currentLocale: string = "ja";

export const setCurrentTranslator = (translator: LooseTranslator, locale: string) => {
  currentTranslator = translator;
  currentLocale = locale;
};

/** React の外から現在の言語を参照する。IntlBridge のマウント前（サーバー側を含む）は ja */
export const getCurrentLocale = () => currentLocale;

const lookupJa = (key: string) => {
  let node: unknown = ja;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
};

const formatJa = (key: string, values?: Values) => {
  const message = lookupJa(key);
  if (message === undefined) return key;
  return message.replace(/\{(\w+)\}/g, (match, name: string) => String(values?.[name] ?? match));
};

/**
 * React の外（ホットキーのハンドラ、バリデーションのエラーメッセージなど）から呼べる翻訳関数。
 * IntlBridge がマウントされるまで（サーバー側を含む）は日本語のメッセージを返す。キーの型チェックはできない
 */
export const translate: LooseTranslator = (key, values) => {
  if (!currentTranslator) return formatJa(key, values);
  return currentTranslator(key, values);
};
