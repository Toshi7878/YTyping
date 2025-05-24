import { RouterInputs } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type Input = RouterInputs["userStats"]["incrementImeStats"];
type UserId = { userId: number };

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const { userId, ...input }: Input & UserId = JSON.parse(bodyText);

    const updateData: Prisma.user_statsUpdateInput = {
      ime_type_total_count: { increment: input.ime_type },
      total_typing_time: { increment: input.total_type_time },
    };

    await prisma.user_stats.upsert({
      where: {
        user_id: userId,
      },
      update: updateData,
      create: {
        user_id: userId,
        ime_type_total_count: input.ime_type,
        total_typing_time: input.total_type_time,
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
        ime_type_count: { increment: input.ime_type },
      },
      create: {
        user_id: userId,
        created_at: dbDate,
        ime_type_count: input.ime_type,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error :", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
