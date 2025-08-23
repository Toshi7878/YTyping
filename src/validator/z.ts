import i18next from "i18next";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";
import translation from "zod-i18n-map/locales/ja/zod.json";

i18next.init({
  lng: "ja",
  resources: {
    ja: { zod: translation },
  },
});

const customErrorMap = (issue: z.ZodIssueOptionalMessage, ctx: z.ErrorMapCtx) => {
  const mapped = zodI18nMap(issue, ctx);

  if (Array.isArray(mapped.message)) {
    return {
      message: mapped.message[0] || "エラーが発生しました",
    };
  }

  return mapped;
};

z.setErrorMap(customErrorMap);

export { z };
