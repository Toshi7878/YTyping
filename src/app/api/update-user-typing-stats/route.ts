import { RouterInputs } from "@/server/api/trpc";
import { db, schema } from "@/server/drizzle/client";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

type Input = RouterInputs["userStats"]["incrementTypingStats"];
type UserId = { userId: number };

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const { userId, ...input }: Input & UserId = JSON.parse(bodyText);

    const currentStats = await db
      .select({ max_combo: schema.UserStats.maxCombo })
      .from(schema.UserStats)
      .where(eq(schema.UserStats.userId, userId))
      .limit(1);

    const currentMax = currentStats[0]?.max_combo ?? 0;
    const isUpdateMaxCombo = input.maxCombo > currentMax;

    const { romaType, kanaType, flickType, englishType, numType, symbolType, spaceType } = input;

    await db
      .insert(schema.UserStats)
      .values({
        userId,
        romaTypeTotalCount: romaType,
        kanaTypeTotalCount: kanaType,
        flickTypeTotalCount: flickType,
        englishTypeTotalCount: englishType,
        numTypeTotalCount: numType,
        symbolTypeTotalCount: symbolType,
        spaceTypeTotalCount: spaceType,
        totalTypingTime: input.totalTypeTime,
        maxCombo: input.maxCombo,
      })
      .onConflictDoUpdate({
        target: [schema.UserStats.userId],
        set: {
          romaTypeTotalCount: sql`${schema.UserStats.romaTypeTotalCount} + ${romaType}`,
          kanaTypeTotalCount: sql`${schema.UserStats.kanaTypeTotalCount} + ${kanaType}`,
          flickTypeTotalCount: sql`${schema.UserStats.flickTypeTotalCount} + ${flickType}`,
          englishTypeTotalCount: sql`${schema.UserStats.englishTypeTotalCount} + ${englishType}`,
          numTypeTotalCount: sql`${schema.UserStats.numTypeTotalCount} + ${numType}`,
          symbolTypeTotalCount: sql`${schema.UserStats.symbolTypeTotalCount} + ${symbolType}`,
          spaceTypeTotalCount: sql`${schema.UserStats.spaceTypeTotalCount} + ${spaceType}`,
          totalTypingTime: sql`${schema.UserStats.totalTypingTime} + ${input.totalTypeTime}`,
          ...(isUpdateMaxCombo ? { maxCombo: input.maxCombo } : {}),
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

    await db
      .insert(schema.UserDailyTypeCounts)
      .values({
        userId,
        createdAt: dbDate,
        romaTypeCount: romaType,
        kanaTypeCount: kanaType,
        flickTypeCount: flickType,
        englishTypeCount: englishType,
        otherTypeCount: spaceType + numType + symbolType,
      })
      .onConflictDoUpdate({
        target: [schema.UserDailyTypeCounts.userId, schema.UserDailyTypeCounts.createdAt],
        set: {
          romaTypeCount: sql`${schema.UserDailyTypeCounts.romaTypeCount} + ${romaType}`,
          kanaTypeCount: sql`${schema.UserDailyTypeCounts.kanaTypeCount} + ${kanaType}`,
          flickTypeCount: sql`${schema.UserDailyTypeCounts.flickTypeCount} + ${flickType}`,
          englishTypeCount: sql`${schema.UserDailyTypeCounts.englishTypeCount} + ${englishType}`,
          otherTypeCount: sql`${schema.UserDailyTypeCounts.otherTypeCount} + ${spaceType + numType + symbolType}`,
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error :", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
