"use server";

import { supabase } from "@/lib/supabaseClient";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { UploadResult } from "@/types";
import { LineResultData, SendResultData } from "../../app/type/ts/type";

import { z } from "zod";

const statusSchema = z.object({
  score: z.number(),
  kanaType: z.number(),
  romaType: z.number(),
  flickType: z.number(),
  miss: z.number(),
  lost: z.number(),
  maxCombo: z.number(),
  kpm: z.number(),
  rkpm: z.number(),
  romaKpm: z.number(),
  defaultSpeed: z.number(),
});

const resultSendSchema = z.object({
  mapId: z.number(),
  status: statusSchema,
});

const calcRank = async (mapId: number, userId: number) => {
  const rankingList = await prisma.results.findMany({
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

  const overtakeNotify = await prisma.notifications.findMany({
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
      await prisma.notifications.delete({
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

    await prisma.results.update({
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
      await prisma.notifications.upsert({
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

  await prisma.maps.update({
    where: {
      id: mapId,
    },
    data: {
      ranking_count: rankingList.length,
    },
  });
};

const sendLineResult = async (mapId: number, lineResults: LineResultData[]) => {
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

const sendNewResult = async (data: SendResultData, userId: number) => {
  const upsertResult = await prisma.results.upsert({
    where: {
      user_id_map_id: {
        user_id: userId,
        map_id: data.mapId,
      },
    },
    update: {
      ...data.status,
      updated_at: new Date(),
    },
    create: {
      map_id: data.mapId,
      user_id: userId,
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
    mapId: data.mapId,
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
    const mapId = await sendNewResult(data, userId);
    await sendLineResult(mapId, lineResults);
    await calcRank(data.mapId, userId);
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
