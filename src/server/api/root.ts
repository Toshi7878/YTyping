import { mapRouter } from "./routers/mapRouter";
import { notificationRouter } from "./routers/notificationRouter";
import { rankingRouter } from "./routers/rankingRouter";
import { userProfileSettingRouter } from "./routers/userProfileSettingRouter";
import { userTypingOptionRouter } from "./routers/userTypingOptionRouter";
import { router } from "./trpc";

export const appRouter = router({
  map: mapRouter,
  userTypingOption: userTypingOptionRouter,
  notification: notificationRouter,
  ranking: rankingRouter,
  userProfileSetting: userProfileSettingRouter,
});

export type AppRouter = typeof appRouter;
