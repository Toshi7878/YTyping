"use server";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { UploadResult } from "@/types";

async function updateClap(resultId: number, userId: number, optimisticState: boolean) {
  await prisma.$transaction(async (db) => {
    const claped = await db.clap.upsert({
      where: {
        userId_resultId: {
          userId,
          resultId,
        },
      },
      update: {
        isClaped: optimisticState,
      },
      create: {
        userId,
        resultId,
        isClaped: true,
      },
    });

    const newClapCount = await db.clap.count({
      where: {
        resultId: resultId,
        isClaped: true, // resultIdのisClapedがtrueのものをカウント
      },
    });

    await db.result.update({
      where: {
        id: resultId,
      },
      data: {
        clapCount: newClapCount,
      },
    });

    return claped;
  });
}

export async function toggleClapServerAction(
  resultId: number,
  optimisticState: boolean,
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
