"use server";

import { supabase } from "@/lib/supabaseClient";
import { auth } from "@/server/auth";
import { UploadResult } from "@/types";
import { PrismaClient } from "@prisma/client";
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

export const resultSendSchema = z.object({
  mapId: z.number(),
  status: statusSchema,
});

const prisma = new PrismaClient();

const calcRank = async (mapId: number, userId: number) => {
  const rankingList = await prisma.result.findMany({
    where: {
      mapId: mapId,
    },
    select: {
      userId: true,
      score: true,
      rank: true,
    },
    orderBy: { score: "desc" },
  });

  const overtakeNotify = await prisma.notification.findMany({
    where: {
      visited_id: userId,
      mapId: mapId,
      action: "ot",
    },
    select: {
      visitorResult: {
        select: {
          userId: true,
          score: true,
        },
      },
    },
  });

  const myResult = rankingList.find((record) => record.userId === userId);

  for (let i = 0; i < overtakeNotify.length; i++) {
    const visitorScore = overtakeNotify[i].visitorResult.score;
    const myScore = myResult?.score;
    if (visitorScore - Number(myScore) <= 0) {
      const visitorId = overtakeNotify[i].visitorResult.userId;
      await prisma.notification.delete({
        where: {
          visitor_id_visited_id_mapId_action: {
            visitor_id: visitorId,
            visited_id: userId,
            mapId: mapId,
            action: "ot",
          },
        },
      });
    }
  }

  for (let i = 0; i < rankingList.length; i++) {
    const newRank = i + 1;

    await prisma.result.update({
      where: {
        userId_mapId: {
          mapId: mapId,
          userId: rankingList[i].userId,
        },
      },
      data: {
        rank: newRank,
      },
    });

    const isOtherUser = rankingList[i].userId !== userId;
    if (isOtherUser && rankingList[i].rank <= 5 && rankingList[i].rank !== newRank) {
      await prisma.notification.upsert({
        where: {
          visitor_id_visited_id_mapId_action: {
            visitor_id: userId,
            visited_id: rankingList[i].userId,
            mapId: mapId,
            action: "ot",
          },
        },
        update: {
          checked: false,
          createdAt: new Date(),
          oldRank: rankingList[i].rank,
        },
        create: {
          visitor_id: userId,
          visited_id: rankingList[i].userId,
          mapId: mapId,
          action: "ot",
          oldRank: rankingList[i].rank,
        },
      });
    }
  }

  await prisma.map.update({
    where: {
      id: mapId,
    },
    data: {
      rankingCount: rankingList.length,
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
  const upsertResult = await prisma.result.upsert({
    where: {
      userId_mapId: {
        userId: userId,
        mapId: data.mapId,
      },
    },
    update: {
      ...data.status,
      updatedAt: new Date(),
    },
    create: {
      mapId: data.mapId,
      userId,
      ...data.status,
    },
  });

  return upsertResult.id;
};

export async function actions(
  data: SendResultData,
  lineResults: LineResultData[],
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
