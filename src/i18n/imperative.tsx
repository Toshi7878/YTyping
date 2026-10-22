"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { setCurrentTranslator } from "./translate";

type LooseTranslator = (key: string, values?: Record<string, string | number>) => string;

/** React の外から現在の言語で翻訳するためのブリッジ（`translate` を参照）。レイアウトに一度だけ置く */
export const IntlBridge = () => {
  const t = useTranslations();
  const locale = useLocale();

  useEffect(() => {
    setCurrentTranslator(t as unknown as LooseTranslator, locale);
  }, [t, locale]);

  return null;
};
