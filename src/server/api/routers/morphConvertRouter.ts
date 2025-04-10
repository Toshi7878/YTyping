import { z } from "@/validator/z";
import { protectedProcedure } from "../trpc";

export const morphConvertRouter = {
  getKanaWordMecabNeologd: protectedProcedure
    .input(z.object({ sentence: z.string().min(1) }))
    .query(async ({ input }) => {
      const data = await postAwsLambdaMecabNeologd(input.sentence);

      return data;
    }),
  getKanaWordYahoo: protectedProcedure.input(z.object({ sentence: z.string().min(1) })).query(async ({ input }) => {
    const data = await fetchYahooMorphAnalysis(input.sentence);

    return data.result.tokens.map((char: string) => char[1]).join("");
  }),
};

async function postAwsLambdaMecabNeologd(sentence: string): Promise<string> {
  const apiKey = process.env.AWS_LAMBDA_MORPH_API_KEY as string;
  const apiUrl = "https://j94myzm4v8.execute-api.ap-northeast-1.amazonaws.com/dev/mecab/parse";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "",
        "x-api-key": apiKey,
      },
      body: sentence,
    });

    if (!response.ok) {
      throw new Error(`API エラー: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error("形態素解析エラー:", error);
    throw new Error("形態素解析中にエラーが発生しました。詳細はログを確認してください。");
  }
}

async function fetchYahooMorphAnalysis(sentence: string): Promise<{ result: { tokens: string[] } }> {
  const apiKey = process.env.YAHOO_APP_ID as string;
  const apiUrl = "https://jlp.yahooapis.jp/MAService/V2/parse";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": `Yahoo AppID: ${apiKey}`,
    },
    body: JSON.stringify({
      id: apiKey,
      jsonrpc: "2.0",
      method: "jlp.maservice.parse",
      params: {
        q: sentence,
        results: "ma",
        response: {
          surface: true,
          reading: true,
          pos: false,
          baseform: false,
        },
      },
    }),
  });

  return response.json();
}
