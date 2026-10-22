import z from "zod";
import { translate } from "@/i18n/translate";

export const LineOptionSchema = z.object({
  changeCSS: z.string().optional(),
  eternalCSS: z.string().optional(),
  isChangeCSS: z.boolean().optional(),
  changeVideoSpeed: z.number().min(-1.75).max(2).optional(),
  isCaseSensitive: z.boolean().optional(),
});

export const RawMapLineSchema = z
  .object({
    time: z.string().max(20),
    lyrics: z.string(),
    word: z.string(),
    options: LineOptionSchema.optional(),
  })
  .strict();

export type RawMapLine = z.infer<typeof RawMapLineSchema>;

const DANGEROUS_TAG_RE = /<\s*\/?\s*(script|iframe|object|embed)\b/i;
const DANGEROUS_ENTITY_TAG_RE = /&lt;\s*\/?\s*(script|iframe|object|embed)\b/i;

const validateNoXssTags = (lines: RawMapLine[]) => {
  return !lines.some((line) => {
    const strings: string[] = [line.time, line.lyrics, line.word];
    const changeCSS = line.options?.changeCSS;
    const eternalCSS = line.options?.eternalCSS;
    if (typeof changeCSS === "string") strings.push(changeCSS);
    if (typeof eternalCSS === "string") strings.push(eternalCSS);

    return strings.some((value) => DANGEROUS_TAG_RE.test(value) || DANGEROUS_ENTITY_TAG_RE.test(value));
  });
};

const validateNoHttpContent = (lines: RawMapLine[]) => {
  return !lines.some((line) =>
    Object.values(line).some((value) => typeof value === "string" && value.includes("http")),
  );
};

const validateHasTypingWords = (lines: RawMapLine[]) => {
  return lines.some((line) => line.word && line.word.length > 0);
};

const validateEndsWithEnd = (lines: RawMapLine[]) => {
  return lines[lines.length - 1]?.lyrics === "end";
};

const validateStartsWithZero = (lines: RawMapLine[]) => {
  return lines[0]?.time === "0";
};

const validateAllTimesAreNumbers = (lines: RawMapLine[]) => {
  return lines.every((line) => !Number.isNaN(Number(line.time)));
};

const validateNoLinesAfterEnd = (lines: RawMapLine[]) => {
  const endAfterLineIndex = lines.findIndex((line) => line.lyrics === "end");
  return endAfterLineIndex === -1 || lines.every((line, index) => index <= endAfterLineIndex || line.lyrics === "end");
};

const validateUniqueTimeValues = (lines: RawMapLine[]) => {
  const timeValues = lines.map((line) => line.time);
  const uniqueTimeValues = new Set(timeValues);
  return timeValues.length === uniqueTimeValues.size;
};

const validateCSSLength = (lines: RawMapLine[]) => {
  const totalCSSLength = lines.reduce((total, line) => {
    const eternalCSSLength = line.options?.eternalCSS?.length || 0;
    const changeCSSLength = line.options?.changeCSS?.length || 0;
    return total + eternalCSSLength + changeCSSLength;
  }, 0);

  return totalCSSLength < 100000;
};

export const RawMapSchema = z
  .array(RawMapLineSchema)
  .refine(validateNoXssTags, {
    error: () => translate("validation.mapXss"),
  })
  .refine(validateNoHttpContent, {
    error: () => translate("validation.mapHttp"),
  })
  .refine(validateHasTypingWords, {
    error: () => translate("validation.mapNoWords"),
  })
  .refine(validateEndsWithEnd, {
    error: () => translate("validation.mapEnd"),
  })
  .refine(validateStartsWithZero, {
    error: () => translate("validation.mapStartZero"),
  })
  .refine(validateAllTimesAreNumbers, {
    error: () => translate("validation.mapTimesNumbers"),
  })
  .refine(validateNoLinesAfterEnd, {
    error: () => translate("validation.mapAfterEnd"),
  })
  .refine(validateUniqueTimeValues, {
    error: () => translate("validation.mapUniqueTimes"),
  })
  .refine(validateCSSLength, {
    error: () => translate("validation.mapCss"),
  });
