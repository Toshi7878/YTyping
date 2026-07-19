import { aiRouter } from "./routers/ai";
import { authRouter } from "./routers/auth";
import { mapRouter } from "./routers/map/map";
import { mapOpenApiRouter } from "./routers/map/open-api/open-api";
import { morphRouter } from "./routers/morph";
import { notificationRouter } from "./routers/notification";
import { rankingPpRouter } from "./routers/ranking/pp/pp";
import { resultRouter } from "./routers/result/result";
import { userImeTypingOptionRouter } from "./routers/user/ime-typing-option";
import { userOptionRouter } from "./routers/user/option";
import { userProfileRouter } from "./routers/user/profile";
import { userReportRouter } from "./routers/user/report";
import { userStatsRouter } from "./routers/user/stats";
import { userTypingOptionRouter } from "./routers/user/typing-option";
import { vercelRouter } from "./routers/vercel";
import { router } from "./trpc";
import "server-only";

export const appRouter = router({
  map: mapRouter,
  result: resultRouter,
  user: {
    profile: userProfileRouter,
    option: userOptionRouter,
    typingOption: userTypingOptionRouter,
    imeTypingOption: userImeTypingOptionRouter,
    stats: userStatsRouter,
    report: userReportRouter,
  },
  ranking: {
    pp: rankingPpRouter,
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
