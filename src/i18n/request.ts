import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import ja from "./messages/ja.json";

type Messages = Record<string, unknown>;

const isMessages = (value: unknown): value is Messages =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** 未翻訳のキーは base（日本語）の文言のまま表示する */
const mergeMessages = (base: Messages, override: Messages): Messages => {
  const merged: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = base[key];
    merged[key] = isMessages(baseValue) && isMessages(value) ? mergeMessages(baseValue, value) : value;
  }
  return merged;
};

/** Cookie → ブラウザの言語（Accept-Language）→ 既定の言語 の順に決める */
const resolveLocale = async (): Promise<Locale> => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  for (const part of acceptLanguage.split(",")) {
    const language = part.split(";")[0]?.trim().toLowerCase().split("-")[0];
    if (isLocale(language)) return language;
  }

  return DEFAULT_LOCALE;
};

// biome-ignore lint/style/noDefaultExport: next-intl が default export を要求する
export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  if (locale === DEFAULT_LOCALE) return { locale, messages: ja };

  const { default: messages } = await import(`./messages/${locale}.json`);
  return { locale, messages: mergeMessages(ja, messages) };
});
