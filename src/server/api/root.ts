import { aiRouter } from "./routers/ai";
import { authRouter } from "./routers/auth";
import { mapRouter } from "./routers/map/map";
import { mapOpenApiRouter } from "./routers/map/open-api/open-api";
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
  map: mapRouter,
  result: {
    list: resultListRouter,
    item: resultItemRouter,
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
  auth: authRouter,
  vercel: vercelRouter,
});

export const openApiRouter = router({
  map: mapOpenApiRouter,
});

export type AppRouter = typeof appRouter;
