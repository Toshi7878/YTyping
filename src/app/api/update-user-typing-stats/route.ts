import { RouterInputs } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";
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

    const updateData: Prisma.user_statsUpdateInput = {
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

    // DBの日付変更基準（15:00）に合わせて日付を計算
    const now = new Date();
    const isAfterCutoff = now.getHours() >= 15;
    const targetDate = new Date();

    // 15時前なら前日の日付、15時以降なら当日の日付
    if (isAfterCutoff) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const dbDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);

    await prisma.user_daily_type_counts.upsert({
      where: {
        user_id_created_at: {
          user_id: userId,
          created_at: dbDate,
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
        created_at: dbDate,
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
