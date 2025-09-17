import { clapRouter } from "./routers/clapRouter";
import { geminiRouter } from "./routers/geminiRouter";
import { likeRouter } from "./routers/likeRouter";
import { mapListRouter } from "./routers/mapListRouter";
import { mapRouter } from "./routers/mapRouter";
import { morphConvertRouter } from "./routers/morphConvertRouter";
import { notificationRouter } from "./routers/notificationRouter";
import { resultRouter } from "./routers/resultRouter";
import { userProfileSettingRouter } from "./routers/userProfileSettingRouter";
import { userRouter } from "./routers/userRouter";
import { userStatsRouter } from "./routers/userStatsRouter";
import { userOptionRouter } from "./routers/userTypingOptionRouter";
import { vercelRouter } from "./routers/vercelRouter";
import { router } from "./trpc";

export const appRouter = router({
  map: mapRouter,
  mapList: mapListRouter,
  notification: notificationRouter,
  result: resultRouter,
  userOption: userOptionRouter,
  userProfileSetting: userProfileSettingRouter,
  userStats: userStatsRouter,
  user: userRouter,
  morphConvert: morphConvertRouter,
  gemini: geminiRouter,
  vercel: vercelRouter,
  clap: clapRouter,
  like: likeRouter,
});

export type AppRouter = typeof appRouter;
