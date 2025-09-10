import { activeUserRouter } from "./routers/activeUserRouter";
import { clapRouter } from "./routers/clapRouter";
import { geminiRouter } from "./routers/geminiRouter";
import { mapListRouter } from "./routers/mapListRouter";
import { mapRouter } from "./routers/mapRouter";
import { morphConvertRouter } from "./routers/morphConvertRouter";
import { notificationRouter } from "./routers/notificationRouter";
import { rankingRouter } from "./routers/rankingRouter";
import { resultRouter } from "./routers/resultRouter";
import { userOptionRouter } from "./routers/userOptionRouter";
import { userProfileSettingRouter } from "./routers/userProfileSettingRouter";
import { userRouter } from "./routers/userRouter";
import { userStatsRouter } from "./routers/userStatsRouter";
import { userTypingOptionRouter } from "./routers/userTypingOptionRouter";
import { vercelRouter } from "./routers/vercelRouter";
import { router } from "./trpc";

export const appRouter = router({
  map: mapRouter,
  mapList: mapListRouter,
  notification: notificationRouter,
  ranking: rankingRouter,
  result: resultRouter,
  userTypingOption: userTypingOptionRouter,
  userProfileSetting: userProfileSettingRouter,
  userStats: userStatsRouter,
  userOption: userOptionRouter,
  user: userRouter,
  activeUser: activeUserRouter,
  morphConvert: morphConvertRouter,
  gemini: geminiRouter,
  vercel: vercelRouter,
  clap: clapRouter,
});

export type AppRouter = typeof appRouter;
