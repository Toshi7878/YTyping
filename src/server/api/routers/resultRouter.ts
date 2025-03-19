import { supabase } from "@/lib/supabaseClient";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";
import { sendResultSchema } from "./rankingRouter";

export const resultRouter = {
  getUserResultData: publicProcedure
    .input(z.object({ resultId: z.number().nullable() }))
    .query(async ({ input }) => {
      try {
        const timestamp = new Date().getTime();

        const { data, error } = await supabase.storage
          .from("user-result") // バケット名を指定
          .download(`public/${input.resultId}.json?timestamp=${timestamp}`);

        if (error) {
          console.error("Error downloading from Supabase:", error);
          throw error;
        }

        const jsonString = await data.text();
        const jsonData = JSON.parse(jsonString);

        return jsonData;
      } catch (error) {
        console.error("Error processing the downloaded file:", error);
        throw error;
      }
    }),
  sendResult: protectedProcedure.input(sendResultSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const mapId = input.mapId;
    const lineResults = input.lineResults;

    return await db.$transaction(async (tx) => {
      await sendResult({
        db: tx,
        lineResults,
        map_id: mapId,
        status: input.status,
        userId: user.id,
      });

      await calcRank({
        db: tx,
        mapId,
        userId: user.id,
      });

      return true;
    });
  }),
};

const calcRank = async ({
  db,
  mapId,
  userId,
}: {
  db: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
  mapId: number;
  userId: number;
}) => {
  try {
    const rankingList = await db.results.findMany({
      where: { map_id: mapId },
      select: {
        user_id: true,
        rank: true,
        status: { select: { score: true } },
      },
      orderBy: { status: { score: "desc" } },
    });

    await processOvertakeNotifications(db, mapId, userId, rankingList);

    await updateRanksAndCreateNotifications(db, mapId, userId, rankingList);

    await updateMapRankingCount(db, mapId, rankingList.length);
  } catch (error) {
    console.error("ランク計算中にエラーが発生しました:", error);
    throw error;
  }
};

const processOvertakeNotifications = async (
  db: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  mapId: number,
  userId: number,
  rankingList: { user_id: number; rank: number | null; status: { score: number } | null }[]
) => {
  const overtakeNotify = await db.notifications.findMany({
    where: {
      visited_id: userId,
      map_id: mapId,
      action: "OVER_TAKE",
    },
    select: {
      visitorResult: {
        select: {
          user_id: true,
          status: { select: { score: true } },
        },
      },
    },
  });

  const myResult = rankingList.find((record) => record.user_id === userId);
  if (!myResult || !myResult.status) return;

  const myScore = myResult.status.score;

  for (const notification of overtakeNotify) {
    const visitorScore = notification.visitorResult.status?.score;
    if (!visitorScore || visitorScore - myScore <= 0) {
      const visitorId = notification.visitorResult.user_id;
      await db.notifications.delete({
        where: {
          visitor_id_visited_id_map_id_action: {
            visitor_id: visitorId,
            visited_id: userId,
            map_id: mapId,
            action: "OVER_TAKE",
          },
        },
      });
    }
  }
};

const updateRanksAndCreateNotifications = async (
  db: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  mapId: number,
  userId: number,
  rankingList: { user_id: number; rank: number | null; status: { score: number } | null }[]
) => {
  for (let i = 0; i < rankingList.length; i++) {
    const user = rankingList[i];
    const newRank = i + 1;
    const oldRank = user.rank;

    await db.results.update({
      where: {
        user_id_map_id: {
          map_id: mapId,
          user_id: user.user_id,
        },
      },
      data: { rank: newRank },
    });

    const isOtherUser = user.user_id !== userId;
    if (isOtherUser && oldRank !== null && oldRank <= 5 && oldRank !== newRank) {
      await db.notifications.upsert({
        where: {
          visitor_id_visited_id_map_id_action: {
            visitor_id: userId,
            visited_id: user.user_id,
            map_id: mapId,
            action: "OVER_TAKE",
          },
        },
        update: {
          checked: false,
          created_at: new Date(),
          old_rank: oldRank,
        },
        create: {
          visitor_id: userId,
          visited_id: user.user_id,
          map_id: mapId,
          action: "OVER_TAKE",
          old_rank: oldRank,
        },
      });
    }
  }
};

const updateMapRankingCount = async (
  db: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  mapId: number,
  rankingCount: number
) => {
  await db.maps.update({
    where: { id: mapId },
    data: { ranking_count: rankingCount },
  });
};

const sendResult = async ({
  db,
  map_id,
  status,
  lineResults,
  userId,
}: {
  db: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
  map_id: number;
  status: z.infer<typeof sendResultSchema>["status"];
  lineResults: z.infer<typeof sendResultSchema>["lineResults"];
  userId: number;
}) => {
  const { id: resultId } = await db.results.upsert({
    where: {
      user_id_map_id: {
        user_id: userId,
        map_id,
      },
    },
    update: {
      updated_at: new Date(),
    },
    create: {
      map_id: map_id,
      user_id: userId,
    },
  });

  await db.result_statuses.upsert({
    where: {
      result_id: resultId,
    },
    update: {
      ...status,
    },
    create: {
      result_id: resultId,
      ...status,
    },
  });

  const jsonString = JSON.stringify(lineResults, null, 2);

  await supabase.storage
    .from("user-result") // バケット名を指定
    .upload(`public/${resultId}.json`, new Blob([jsonString], { type: "application/json" }), {
      upsert: true, // 既存のファイルを上書きするオプションを追加
    });
};
