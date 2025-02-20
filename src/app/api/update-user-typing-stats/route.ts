import { StatusRef } from "@/app/type/ts/type";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";

export async function POST(request: Request) {
  try {
    // JA3フィンガープリントの検証
    const ja3Digest = request.headers.get("x-vercel-ja3-digest");
    throw new Error("JA3 Fingerprint:" + ja3Digest);
    const session = await auth();
    const userId = session ? Number(session?.user.id) : 0;

    const bodyText = await request.text();
    const input: StatusRef["userStats"] = JSON.parse(bodyText);
    const currentStats = await prisma.user_stats.findUnique({
      where: { user_id: userId },
      select: { max_combo: true },
    });

    const updateData: Record<string, any> = {
      roma_type_total_count: { increment: input.romaType },
      kana_type_total_count: { increment: input.kanaType },
      flick_type_total_count: { increment: input.flickType },
      english_type_total_count: { increment: input.englishType },
      num_type_total_count: { increment: input.numType },
      symbol_type_total_count: { increment: input.symbolType },
      space_type_total_count: { increment: input.spaceType },
      total_typing_time: { increment: input.totalTypeTime },
    };

    const isUpdateMaxCombo = !currentStats || input.maxCombo > (currentStats?.max_combo || 0);
    if (isUpdateMaxCombo) {
      updateData.max_combo = input.maxCombo;
    }

    await prisma.user_stats.upsert({
      where: {
        user_id: userId,
      },
      update: updateData,
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
        max_combo: input.maxCombo,
      },
    });
  } catch (error) {
    console.error("Error :", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
