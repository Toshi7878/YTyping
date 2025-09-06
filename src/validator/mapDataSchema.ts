import z from "zod";

export const lineOptionSchema = z.object({
  changeCSS: z.string().optional(),
  eternalCSS: z.string().optional(),
  isChangeCSS: z.boolean().optional(),
  changeVideoSpeed: z.number().min(-1.75).max(2).optional(),
});
const lineSchema = z.object({
  time: z.string().max(20),
  lyrics: z.string().optional(),
  word: z.string().optional(),
  options: lineOptionSchema.optional(),
});

const validateNoHttpContent = (lines: z.infer<typeof lineSchema>[]) => {
  return !lines.some((line) =>
    Object.values(line).some((value) => typeof value === "string" && value.includes("http")),
  );
};

const validateHasTypingWords = (lines: z.infer<typeof lineSchema>[]) => {
  return lines.some((line) => line.word && line.word.length > 0);
};

const validateEndsWithEnd = (lines: z.infer<typeof lineSchema>[]) => {
  return lines[lines.length - 1]?.lyrics === "end";
};

const validateStartsWithZero = (lines: z.infer<typeof lineSchema>[]) => {
  return lines[0]?.time === "0";
};

const validateAllTimesAreNumbers = (lines: z.infer<typeof lineSchema>[]) => {
  return lines.every((line) => !isNaN(Number(line.time)));
};

const validateNoLinesAfterEnd = (lines: z.infer<typeof lineSchema>[]) => {
  const endAfterLineIndex = lines.findIndex((line) => line.lyrics === "end");
  return endAfterLineIndex === -1 || lines.every((line, index) => index <= endAfterLineIndex || line.lyrics === "end");
};

const validateUniqueTimeValues = (lines: z.infer<typeof lineSchema>[]) => {
  const timeValues = lines.map((line) => line.time);
  const uniqueTimeValues = new Set(timeValues);
  return timeValues.length === uniqueTimeValues.size;
};

const validateCSSLength = (lines: z.infer<typeof lineSchema>[]) => {
  const totalCSSLength = lines.reduce((total, line) => {
    const eternalCSSLength = line.options?.eternalCSS?.length || 0;
    const changeCSSLength = line.options?.changeCSS?.length || 0;
    return total + eternalCSSLength + changeCSSLength;
  }, 0);

  return totalCSSLength < 10000;
};

export const mapDataSchema = z
  .array(lineSchema)
  .refine(validateNoHttpContent, {
    message: "譜面データにはhttpから始まる文字を含めることはできません",
  })
  .refine(validateHasTypingWords, {
    message: "タイピングワードが設定されていません",
  })
  .refine(validateEndsWithEnd, {
    message: "最後の歌詞は'end'である必要があります",
  })
  .refine(validateStartsWithZero, {
    message: "最初の時間は0である必要があります",
  })
  .refine(validateAllTimesAreNumbers, {
    message: "timeはすべて数値である必要があります",
  })
  .refine(validateNoLinesAfterEnd, {
    message: "endの後に無効な行があります",
  })
  .refine(validateUniqueTimeValues, {
    message: "同じタイムのラインが2つ以上存在しています。",
  })
  .refine(validateCSSLength, {
    message: "カスタムCSSの合計文字数は10000文字以下になるようにしてください",
  });
