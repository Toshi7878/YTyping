import { auth } from "@/server/auth";
import { prisma } from "@/server/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session ? Number(session.user.id) : 0;

    const bodyText = await request.text();
    const input = JSON.parse(bodyText);
    await prisma.user_stats.upsert({
      where: {
        user_id: userId,
      },
      update: {
        roma_type_total_count: { increment: input.romaType },
        kana_type_total_count: { increment: input.kanaType },
        flick_type_total_count: { increment: input.flickType },
        english_type_total_count: { increment: input.englishType },
        num_type_total_count: { increment: input.numType },
        symbol_type_total_count: { increment: input.symbolType },
        space_type_total_count: { increment: input.spaceType },
        total_typing_time: { increment: input.totalTypeTime },
      },
      create: {
        user_id: userId,
        roma_type_total_count: input.romaType,
        kana_type_total_count: input.kanaType,
        flick_type_total_count: input.flickType,
        english_type_total_count: input.englishType,
        num_type_total_count: input.numType,
        symbol_type_total_count: input.symbolType,
        space_type_total_count: input.spaceType,
        total_typing_time: input.totalTypeTime,
      },
    });
  } catch (error) {
    console.error("Error :", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
