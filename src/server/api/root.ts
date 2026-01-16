import { aiRouter } from "./routers/ai";
import { mapBookmarkDetailRouter } from "./routers/map/bookmark/detail";
import { mapBookmarkListRouter } from "./routers/map/bookmark/list";
import { mapDetailRouter } from "./routers/map/detail";
import { mapLikeRouter } from "./routers/map/like";
import { mapListRouter } from "./routers/map/list";
import { morphRouter } from "./routers/morph";
import { notificationRouter } from "./routers/notification";
import { resultClapRouter } from "./routers/result/clap";
import { resultDetailRouter } from "./routers/result/detail";
import { resultListRouter } from "./routers/result/list";
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
  result: {
    list: resultListRouter,
    detail: resultDetailRouter,
    clap: resultClapRouter,
  },
  user: {
    profile: userProfileRouter,
    option: userOptionRouter,
    typingOption: userTypingOptionRouter,
    imeTypingOption: userImeTypingOptionRouter,
    stats: userStatsRouter,
  },
  notification: notificationRouter,
  morph: morphRouter,
  ai: aiRouter,
  vercel: vercelRouter,
});

export type AppRouter = typeof appRouter;
