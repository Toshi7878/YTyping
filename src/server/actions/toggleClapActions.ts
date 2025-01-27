"use server";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { UploadResult } from "@/types";

async function updateClap(resultId: number, userId: number, optimisticState: boolean) {
  await prisma.$transaction(async (db) => {
    const claped = await db.result_claps.upsert({
      where: {
        user_id_result_id: {
          user_id: userId,
          result_id: resultId,
        },
      },
      update: {
        is_claped: optimisticState,
      },
      create: {
        user_id: userId,
        result_id: resultId,
        is_claped: true,
      },
    });

    const newClapCount = await db.result_claps.count({
      where: {
        result_id: resultId,
        is_claped: true, // resultIdのisClapedがtrueのものをカウント
      },
    });

    await db.results.update({
      where: {
        id: resultId,
      },
      data: {
        clap_count: newClapCount,
      },
    });

    return claped;
  });
}

export async function toggleClapServerAction(
  resultId: number,
  optimisticState: boolean
): Promise<UploadResult> {
  const session = await auth();

  try {
    const userId = Number(session?.user?.id);

    const clapedId = await updateClap(resultId, userId, optimisticState);

    return {
      id: null,
      title: "拍手完了",
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
