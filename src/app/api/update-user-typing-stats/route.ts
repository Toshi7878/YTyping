import { RouterInputs } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { NextResponse } from "next/server";

type Input = RouterInputs["userStats"]["incrementTypingStats"];
type UserId = { userId: number };
export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const { userId, ...input }: Input & UserId = JSON.parse(bodyText);
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

    const { romaType, kanaType, flickType, englishType, numType, symbolType, spaceType } = input;
    await prisma.user_stats.upsert({
      where: {
        user_id: userId,
      },
      update: updateData,
      create: {
        user_id: userId,
        roma_type_total_count: romaType,
        kana_type_total_count: kanaType,
        flick_type_total_count: flickType,
        english_type_total_count: englishType,
        num_type_total_count: numType,
        symbol_type_total_count: symbolType,
        space_type_total_count: spaceType,
        total_typing_time: input.totalTypeTime,
        max_combo: input.maxCombo,
      },
    });

    await prisma.user_daily_type_counts.upsert({
      where: {
        user_id_date: {
          user_id: userId,
          date: new Date().toISOString().split("T")[0],
        },
      },
      update: {
        roma_type_count: { increment: romaType },
        kana_type_count: { increment: kanaType },
        flick_type_count: { increment: flickType },
        english_type_count: { increment: englishType },
        other_type_count: { increment: spaceType + numType + symbolType },
      },
      create: {
        user_id: userId,
        date: new Date().toISOString().split("T")[0],
        roma_type_count: romaType,
        kana_type_count: kanaType,
        flick_type_count: flickType,
        english_type_count: englishType,
        other_type_count: spaceType + numType + symbolType,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error :", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
