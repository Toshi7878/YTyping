import { mapRouter } from "./routers/mapRouter";
import { notificationRouter } from "./routers/notificationRouter";
import { rankingRouter } from "./routers/rankingRouter";
import { resultRouter } from "./routers/resultRouter";
import { userProfileSettingRouter } from "./routers/userProfileSettingRouter";
import { userTypingOptionRouter } from "./routers/userTypingOptionRouter";
import { userTypingStatsRouter } from "./routers/userTypingStatsRouter";
import { router } from "./trpc";

export const appRouter = router({
  map: mapRouter,
  userTypingOption: userTypingOptionRouter,
  notification: notificationRouter,
  ranking: rankingRouter,
  result: resultRouter,
  userProfileSetting: userProfileSettingRouter,
  userTypingStats: userTypingStatsRouter,
});

export type AppRouter = typeof appRouter;
