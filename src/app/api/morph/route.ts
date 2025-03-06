import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sentence } = body;

    const apiUrl = "https://labs.goo.ne.jp/api/morph";
    const apiKey = "48049f223f8d9169a08de4e3bba21f64e4c17a7771620c1b8bb20574b87ea813";

    const response = await fetch(apiUrl, {
      method: "GET",
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
