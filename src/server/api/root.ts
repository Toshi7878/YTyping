import { bookmarkListRouter } from "./routers/bookmark/list";
import { bookmarkListItemRouter } from "./routers/bookmark/list-item";
import { clapRouter } from "./routers/clap";
import { geminiRouter } from "./routers/gemini";
import { likeRouter } from "./routers/like";
import { mapListRouter } from "./routers/map/list";
import { mapRouter } from "./routers/map/map";
import { morphConvertRouter } from "./routers/morph";
import { notificationRouter } from "./routers/notification";
import { resultListRouter } from "./routers/result/list";
import { resultRouter } from "./routers/result/result";
import { userOptionRouter } from "./routers/typing-option";
import { userProfileRouter } from "./routers/user-profile";
import { userStatsRouter } from "./routers/user-stats";
import { vercelRouter } from "./routers/vercel";
import { router } from "./trpc";

export const appRouter = router({
  map: mapRouter,
  mapList: mapListRouter,
  notification: notificationRouter,
  result: resultRouter,
  resultList: resultListRouter,
  userOption: userOptionRouter,
  userProfile: userProfileRouter,
  userStats: userStatsRouter,
  morphConvert: morphConvertRouter,
  gemini: geminiRouter,
  vercel: vercelRouter,
  clap: clapRouter,
  like: likeRouter,
  bookmarkListItem: bookmarkListItemRouter,
  bookmarkList: bookmarkListRouter,
});

export type AppRouter = typeof appRouter;
