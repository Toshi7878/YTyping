import { RouterInputs } from "@/server/api/trpc";
import { db as drizzleDb, schema } from "@/server/drizzle/client";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

type Input = RouterInputs["userStats"]["incrementImeStats"];
type UserId = { userId: number };

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const { userId, ...input }: Input & UserId = JSON.parse(bodyText);

    // Upsert user_stats with increments
    await drizzleDb
      .insert(schema.userStats)
      .values({
        userId,
        imeTypeTotalCount: input.ime_type,
        totalTypingTime: input.total_type_time,
      })
      .onConflictDoUpdate({
        target: [schema.userStats.userId],
        set: {
          imeTypeTotalCount: sql`${schema.userStats.imeTypeTotalCount} + ${input.ime_type}`,
          totalTypingTime: sql`${schema.userStats.totalTypingTime} + ${input.total_type_time}`,
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

    await drizzleDb
      .insert(schema.userDailyTypeCounts)
      .values({ userId, createdAt: dbDate, imeTypeCount: input.ime_type })
      .onConflictDoUpdate({
        target: [schema.userDailyTypeCounts.userId, schema.userDailyTypeCounts.createdAt],
        set: { imeTypeCount: sql`${schema.userDailyTypeCounts.imeTypeCount} + ${input.ime_type}` },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error :", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
