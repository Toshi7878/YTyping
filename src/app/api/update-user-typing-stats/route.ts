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
      .select({ max_combo: schema.userStats.maxCombo })
      .from(schema.userStats)
      .where(eq(schema.userStats.userId, userId))
      .limit(1);

    const currentMax = currentStats[0]?.max_combo ?? 0;
    const isUpdateMaxCombo = input.maxCombo > currentMax;

    const { romaType, kanaType, flickType, englishType, numType, symbolType, spaceType } = input;

    await db
      .insert(schema.userStats)
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
        target: [schema.userStats.userId],
        set: {
          romaTypeTotalCount: sql`${schema.userStats.romaTypeTotalCount} + ${romaType}`,
          kanaTypeTotalCount: sql`${schema.userStats.kanaTypeTotalCount} + ${kanaType}`,
          flickTypeTotalCount: sql`${schema.userStats.flickTypeTotalCount} + ${flickType}`,
          englishTypeTotalCount: sql`${schema.userStats.englishTypeTotalCount} + ${englishType}`,
          numTypeTotalCount: sql`${schema.userStats.numTypeTotalCount} + ${numType}`,
          symbolTypeTotalCount: sql`${schema.userStats.symbolTypeTotalCount} + ${symbolType}`,
          spaceTypeTotalCount: sql`${schema.userStats.spaceTypeTotalCount} + ${spaceType}`,
          totalTypingTime: sql`${schema.userStats.totalTypingTime} + ${input.totalTypeTime}`,
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
      .insert(schema.userDailyTypeCounts)
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
        target: [schema.userDailyTypeCounts.userId, schema.userDailyTypeCounts.createdAt],
        set: {
          romaTypeCount: sql`${schema.userDailyTypeCounts.romaTypeCount} + ${romaType}`,
          kanaTypeCount: sql`${schema.userDailyTypeCounts.kanaTypeCount} + ${kanaType}`,
          flickTypeCount: sql`${schema.userDailyTypeCounts.flickTypeCount} + ${flickType}`,
          englishTypeCount: sql`${schema.userDailyTypeCounts.englishTypeCount} + ${englishType}`,
          otherTypeCount: sql`${schema.userDailyTypeCounts.otherTypeCount} + ${spaceType + numType + symbolType}`,
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error :", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
