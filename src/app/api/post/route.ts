import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    await prisma.map.updateMany({
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
    console.error("Error fetching ranking list:", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}