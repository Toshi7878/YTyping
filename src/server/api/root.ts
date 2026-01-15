import { aiRouter } from "./routers/ai";
import { mapBookmarkDetailRouter } from "./routers/map/bookmark/detail";
import { mapBookmarkListRouter } from "./routers/map/bookmark/list";
import { mapDetailRouter } from "./routers/map/detail";
import { mapLikeRouter } from "./routers/map/like";
import { mapListRouter } from "./routers/map/list";
import { morphConvertRouter } from "./routers/morph";
import { notificationRouter } from "./routers/notification";
import { resultClapRouter } from "./routers/result/clap";
import { resultListRouter } from "./routers/result/list";
import { resultRouter } from "./routers/result/result";
import { userImeTypingOptionRouter } from "./routers/user/ime-typing-option";
import { userOptionRouter } from "./routers/user/option";
import { userProfileRouter } from "./routers/user/profile";
import { userStatsRouter } from "./routers/user/stats";
import { userTypingOptionRouter } from "./routers/user/typing-option";
import { vercelRouter } from "./routers/vercel";
import { router } from "./trpc";
export const appRouter = router({
  map: {
    list: mapListRouter,
    detail: mapDetailRouter,
    like: mapLikeRouter,
    bookmark: {
      list: mapBookmarkListRouter,
      detail: mapBookmarkDetailRouter,
    },
  },
  notification: notificationRouter,
  result: resultRouter,
  resultList: resultListRouter,
  user: {
    profile: userProfileRouter,
    option: userOptionRouter,
    typingOption: userTypingOptionRouter,
    imeTypingOption: userImeTypingOptionRouter,
    stats: userStatsRouter,
  },
  morphConvert: morphConvertRouter,
  ai: aiRouter,
  vercel: vercelRouter,
  clap: resultClapRouter,
});

export type AppRouter = typeof appRouter;
