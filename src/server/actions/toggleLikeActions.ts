"use server";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { UploadResult } from "@/types";
import { revalidatePath } from "next/cache";

async function updateLike(mapId: number, userId: number, optimisticState: boolean) {
  await prisma.$transaction(async (db) => {
    const liked = await db.mapLike.upsert({
      where: {
        userId_mapId: {
          userId,
          mapId,
        },
      },
      update: {
        isLiked: optimisticState,
      },
      create: {
        userId,
        mapId,
        isLiked: true,
      },
    });

    const newLikeCount = await db.mapLike.count({
      where: {
        mapId: mapId,
        isLiked: true, // resultIdのisClapedがtrueのものをカウント
      },
    });

    await db.map.update({
      where: {
        id: mapId,
      },
      data: {
        likeCount: newLikeCount,
      },
    });
  });
}

export async function toggleLikeServerAction(
  mapId: number,
  optimisticState: boolean,
): Promise<UploadResult> {
  const session = await auth();

  try {
    const userId = Number(session?.user?.id);

    await updateLike(mapId, userId, optimisticState);

    revalidatePath(`/api/map-info`);
    return {
      id: null,
      title: "いいね完了",
      message: "",
      status: 200,
    };
  } catch (error) {
    return {
      id: null,
      title: "サーバー側で問題が発生しました",
      message: "しばらく時間をおいてから再度お試しください。",
      status: 500,
      errorObject: error instanceof Error ? error.message : String(error), // エラーオブジェクトを文字列に変換
    };
  }
}
