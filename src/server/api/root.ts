import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server";
import { aiRouter } from "./routers/ai";
import { authRouter } from "./routers/auth";
import { contactRouter } from "./routers/contact";
import { importantNoticeRouter } from "./routers/important-notice";
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
import "server-only";

export const appRouter = {
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
  importantNotice: importantNoticeRouter,
  morph: morphRouter,
  ai: aiRouter,
  auth: authRouter,
  contact: contactRouter,
  vercel: vercelRouter,
};

export const openApiRouter = {
  map: mapOpenApiRouter,
};

export type AppRouter = typeof appRouter;
export type RouterInputs = InferRouterInputs<AppRouter>;
export type RouterOutputs = InferRouterOutputs<AppRouter>;
