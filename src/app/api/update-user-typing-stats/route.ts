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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error :", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
