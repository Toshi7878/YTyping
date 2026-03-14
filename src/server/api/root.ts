import { aiRouter } from "./routers/ai";
import { mapBookmarkListItemRouter } from "./routers/map/bookmark/list-item";
import { mapBookmarkListsRouter } from "./routers/map/bookmark/lists";
import { mapItemRouter } from "./routers/map/item";
import { mapLikeRouter } from "./routers/map/like";
import { mapListRouter } from "./routers/map/list";
import { morphRouter } from "./routers/morph";
import { notificationRouter } from "./routers/notification";
import { resultClapRouter } from "./routers/result/clap";
import { resultItemRouter } from "./routers/result/item";
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
    item: mapItemRouter,
    like: mapLikeRouter,
    bookmark: {
      lists: mapBookmarkListsRouter,
      listItem: mapBookmarkListItemRouter,
    },
  },
  result: {
    list: resultListRouter,
    detail: resultItemRouter,
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
