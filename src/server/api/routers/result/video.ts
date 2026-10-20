import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import type { DBType } from "@/server/drizzle/client";
import { results } from "@/server/drizzle/schema";
import { buildPlayVideoUrl, parsePlayVideoUrl } from "@/utils/play-video";
import { notifyAdmins } from "../../lib/discord";
import { type ORPCContext, protectedProcedure } from "../../orpc";

const UNSUPPORTED_VIDEO_URL_MESSAGE = "対応していない動画のURLです";

type AuthedSession = NonNullable<ORPCContext["session"]>;

/** プレイ動画を登録できるのは自分の記録のみ。管理者は全ての記録に対して操作できる */
const findEditableResult = async (db: DBType, session: AuthedSession, resultId: number) => {
  const result = await db.query.results.findFirst({
    columns: { id: true, userId: true, mapId: true, invalidatedAt: true },
    where: { id: resultId },
  });
  if (!result) throw new ORPCError("NOT_FOUND", { message: "記録が見つかりません" });

  if (result.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new ORPCError("FORBIDDEN", { message: "自分の記録にのみプレイ動画を登録できます" });
  }
  return result;
};

export const resultVideoRouter = {
  set: protectedProcedure
    .input(z.object({ resultId: z.number(), url: z.string().trim().min(1).max(500) }))
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const result = await findEditableResult(db, session, input.resultId);

      const video = parsePlayVideoUrl(input.url);
      if (!video) throw new ORPCError("BAD_REQUEST", { message: UNSUPPORTED_VIDEO_URL_MESSAGE });

      await db
        .update(results)
        .set({ playVideoPlatform: video.platform, playVideoId: video.videoId })
        .where(eq(results.id, result.id));

      // 確認中の記録に本人が動画を登録したときは、復旧の確認ができるよう運営に知らせる
      if (result.invalidatedAt && result.userId === session.user.id) {
        notifyAdmins({
          title: "確認中の記録にプレイ動画が登録されました",
          description: buildPlayVideoUrl(video.platform, video.videoId) ?? input.url,
          adminPath: "/admin/invalid-results",
          fields: [
            { name: "譜面ID", value: String(result.mapId) },
            { name: "記録ID", value: String(result.id) },
            { name: "ユーザー", value: session.user.name ?? `ID: ${session.user.id}` },
          ],
        });
      }
    }),

  remove: protectedProcedure.input(z.object({ resultId: z.number() })).handler(async ({ input, context }) => {
    const { db, session } = context;
    const result = await findEditableResult(db, session, input.resultId);

    await db.update(results).set({ playVideoPlatform: null, playVideoId: null }).where(eq(results.id, result.id));
  }),
};
