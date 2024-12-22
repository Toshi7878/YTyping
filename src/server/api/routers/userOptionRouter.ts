import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { publicProcedure } from "../trpc";

export const userOptionRouter = {
  getUserTypingOptions: publicProcedure.query(async () => {
    const session = await auth();
    const userId = session?.user ? Number(session?.user.id) : 0;

    const userTypingOptions = await db.typingOption.findUnique({
      where: { userId },
      select: {
        timeOffset: true,
        typeSound: true,
        missSound: true,
        lineClearSound: true,
        nextDisplay: true,
        timeOffsetKey: true,
        toggleInputModeKey: true,
      }, // 全てのカラムを取得するためにselectをnullに設定
    });

    return userTypingOptions;
  }),
};
