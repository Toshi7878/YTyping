import { z } from "@/validator/z";
import Kuroshiro from "kuroshiro";
import { protectedProcedure } from "../trpc";
// Initialize kuroshiro with an instance of analyzer (You could check the [apidoc](#initanalyzer) for more information):
// For this example, you should npm install and import the kuromoji analyzer first
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
const kuroshiro = new Kuroshiro();

export const morphConvertRouter = {
  getKanaWord: protectedProcedure.input(z.object({ sentence: z.string().min(1) })).query(async ({ input }) => {
    await kuroshiro.init(new KuromojiAnalyzer());

    // Convert what you want:
    const result = await kuroshiro.convert(input.sentence, {
      to: "hiragana",
    });

    return result;

    // Yahoo MorphKanaConverter
    // const data = await fetchYahooMorphAnalysis(input.sentence);
    // return data.result.tokens.map((char: string) => char[1]).join("");
  }),
};

// async function fetchYahooMorphAnalysis(sentence: string): Promise<{ result: { tokens: string[] } }> {
//   const apiKey = process.env.YAHOO_APP_ID as string;
//   const apiUrl = "https://jlp.yahooapis.jp/MAService/V2/parse";

//   const response = await fetch(apiUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "User-Agent": `Yahoo AppID: ${apiKey}`,
//     },
//     body: JSON.stringify({
//       id: apiKey,
//       jsonrpc: "2.0",
//       method: "jlp.maservice.parse",
//       params: {
//         q: sentence,
//         results: "ma",
//         response: {
//           surface: true,
//           reading: true,
//           pos: false,
//           baseform: false,
//         },
//       },
//     }),
//   });

//   return response.json();
// }
