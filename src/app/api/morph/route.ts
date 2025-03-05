import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sentence } = body;

    const apiUrl = "https://labs.goo.ne.jp/api/morph";
    const apiKey = process.env.NEXT_PUBLIC_MORPH_API_KEY as string;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: apiKey,
        sentence: sentence,
        info_filter: "form|read",
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Morph API error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
