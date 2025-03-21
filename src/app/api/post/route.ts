import { prisma } from "@/server/db";

export async function POST(request: Request) {
  try {
    await prisma.maps.updateMany({
      where: {
        category: {
          equals: null,
        },
      },
      data: {
        category: [],
      },
    });

    return new Response(JSON.stringify("done"), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
