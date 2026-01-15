import { aiRouter } from "./routers/ai";
import { bookmarkListRouter } from "./routers/bookmark/list";
import { bookmarkListItemRouter } from "./routers/bookmark/list-item";
import { mapLikeRouter } from "./routers/map/like";
import { mapListRouter } from "./routers/map/list";
import { mapRouter } from "./routers/map/map";
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
    detail: mapRouter,
    like: mapLikeRouter,
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
  bookmarkListItem: bookmarkListItemRouter,
  bookmarkList: bookmarkListRouter,
});

export type AppRouter = typeof appRouter;
