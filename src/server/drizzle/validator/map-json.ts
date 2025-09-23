import z from "zod";

export const LineOptionSchema = z.object({
  changeCSS: z.string().optional(),
  eternalCSS: z.string().optional(),
  isChangeCSS: z.boolean().optional(),
  changeVideoSpeed: z.number().min(-1.75).max(2).optional(),
});

const lineSchema = z.object({
  time: z.string().max(20),
  lyrics: z.string().optional(),
  word: z.string().optional(),
  options: LineOptionSchema.optional(),
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
    error: "譜面データにはhttpから始まる文字を含めることはできません",
  })
  .refine(validateHasTypingWords, {
    error: "タイピングワードが設定されていません",
  })
  .refine(validateEndsWithEnd, {
    error: "最後の歌詞は'end'である必要があります",
  })
  .refine(validateStartsWithZero, {
    error: "最初の時間は0である必要があります",
  })
  .refine(validateAllTimesAreNumbers, {
    error: "timeはすべて数値である必要があります",
  })
  .refine(validateNoLinesAfterEnd, {
    error: "endの後に無効な行があります",
  })
  .refine(validateUniqueTimeValues, {
    error: "同じタイムのラインが2つ以上存在しています。",
  })
  .refine(validateCSSLength, {
    error: "カスタムCSSの合計文字数は10000文字以下になるようにしてください",
  });
