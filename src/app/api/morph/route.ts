import { NextRequest, NextResponse } from "next/server";

const YAHOO_API_URL = "https://jlp.yahooapis.jp/MAService/V2/parse";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = process.env.YAHOO_APP_ID;

    if (!apiKey) {
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
    }

    const response = await fetchYahooMorphAnalysis(body.sentence, apiKey);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Yahoo API responded with status: ${response.status}`, errorText);
      throw new Error(`Yahoo API responded with status: ${response.status}`);
    }

    // レスポンスがJSONかどうか確認
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Yahoo API returned non-JSON response:", text);
      return NextResponse.json({ error: "API returned invalid format" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data.result);
  } catch (error) {
    console.error("Error in Yahoo morph API route:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

/**
 * Yahoo形態素解析APIを呼び出す関数
 */
async function fetchYahooMorphAnalysis(sentence: string, apiKey: string): Promise<Response> {
  return fetch(YAHOO_API_URL, {
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
}
