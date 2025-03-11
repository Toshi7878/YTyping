"use server";

import { supabase } from "@/lib/supabaseClient";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { UploadResult } from "@/types";
import { LineResultData, SendResultData } from "../../app/type/ts/type";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const statusSchema = z.object({
  score: z.number(),
  kana_type: z.number(),
  roma_type: z.number(),
  flick_type: z.number(),
  miss: z.number(),
  lost: z.number(),
  max_combo: z.number(),
  kpm: z.number(),
  rkpm: z.number(),
  roma_kpm: z.number(),
  default_speed: z.number(),
});

const resultSendSchema = z.object({
  mapId: z.number(),
  status: statusSchema,
});

const calcRank = async ({
  db,
  mapId,
  userId,
}: {
  db: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
  mapId: number;
  userId: number;
}) => {
  const rankingList = await db.results.findMany({
    where: {
      map_id: mapId,
    },
    select: {
      user_id: true,
      rank: true,
      status: {
        select: {
          score: true,
        },
      },
    },
    orderBy: { status: { score: "desc" } },
  });

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
          status: {
            select: {
              score: true,
            },
          },
        },
      },
    },
  });

  const myResult = rankingList.find((record) => record.user_id === userId);

  for (let i = 0; i < overtakeNotify.length; i++) {
    const visitorScore = overtakeNotify[i].visitorResult.status!.score;
    const myScore = myResult?.status!.score;
    if (visitorScore - Number(myScore) <= 0) {
      const visitorId = overtakeNotify[i].visitorResult.user_id;
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

  for (let i = 0; i < rankingList.length; i++) {
    const newRank = i + 1;

    await db.results.update({
      where: {
        user_id_map_id: {
          map_id: mapId,
          user_id: rankingList[i].user_id,
        },
      },
      data: {
        rank: newRank,
      },
    });

    const isOtherUser = rankingList[i].user_id !== userId;
    if (isOtherUser && rankingList[i].rank <= 5 && rankingList[i].rank !== newRank) {
      await db.notifications.upsert({
        where: {
          visitor_id_visited_id_map_id_action: {
            visitor_id: userId,
            visited_id: rankingList[i].user_id,
            map_id: mapId,
            action: "OVER_TAKE",
          },
        },
        update: {
          checked: false,
          created_at: new Date(),
          old_rank: rankingList[i].rank,
        },
        create: {
          visitor_id: userId,
          visited_id: rankingList[i].user_id,
          map_id: mapId,
          action: "OVER_TAKE",
          old_rank: rankingList[i].rank,
        },
      });
    }
  }

  await db.maps.update({
    where: {
      id: mapId,
    },
    data: {
      ranking_count: rankingList.length,
    },
  });
};

const sendLineResult = async ({
  mapId,
  lineResults,
}: {
  mapId: number;
  lineResults: LineResultData[];
}) => {
  const jsonString = JSON.stringify(lineResults, null, 2);

  // Supabaseストレージにアップロード
  const { error } = await supabase.storage
    .from("user-result") // バケット名を指定
    .upload(`public/${mapId}.json`, new Blob([jsonString], { type: "application/json" }), {
      upsert: true, // 既存のファイルを上書きするオプションを追加
    });

  if (error) {
    console.error("Error uploading to Supabase:", error);
    throw error;
  }
};

const sendNewResult = async ({
  db,
  data,
  userId,
}: {
  db: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
  data: SendResultData;
  userId: number;
}) => {
  const upsertResult = await db.results.upsert({
    where: {
      user_id_map_id: {
        user_id: userId,
        map_id: data.map_id,
      },
    },
    update: {
      updated_at: new Date(),
    },
    create: {
      map_id: data.map_id,
      user_id: userId,
    },
  });

  await db.result_statuses.upsert({
    where: {
      result_id: upsertResult.id,
    },
    update: {
      ...data.status,
    },
    create: {
      result_id: upsertResult.id,
      ...data.status,
    },
  });

  return upsertResult.id;
};

export async function actions(
  data: SendResultData,
  lineResults: LineResultData[]
): Promise<UploadResult> {
  const validatedFields = resultSendSchema.safeParse({
    mapId: data.map_id,
    status: data.status,
  });

  if (!validatedFields.success) {
    return {
      id: null,
      title: "ランキングデータが正常ではありませんでした。",
      message: validatedFields.error.errors[0].message,
      status: 400,
    };
  }
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);
    const mapId = await prisma.$transaction(async (tx) => {
      const mapId = await sendNewResult({ db: tx, data, userId });
      await sendLineResult({ mapId, lineResults });
      await calcRank({ db: tx, mapId: data.map_id, userId });
      return mapId;
    });

    revalidatePath("/(home)");

    return {
      id: mapId,
      title: "ランキング登録が完了しました",
      message: "",
      status: 200,
    };
  } catch (error) {
    return { id: null, title: "サーバー側で問題が発生しました", message: "", status: 500 };
  }
}
