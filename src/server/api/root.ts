import { clapRouter } from "./routers/clap"
import { geminiRouter } from "./routers/gemini"
import { likeRouter } from "./routers/like"
import { mapRouter } from "./routers/map"
import { mapListRouter } from "./routers/map-list"
import { morphConvertRouter } from "./routers/morph"
import { notificationRouter } from "./routers/notification"
import { resultRouter } from "./routers/result"
import { userOptionRouter } from "./routers/typing-option"
import { userProfileRouter } from "./routers/user-profile"
import { userStatsRouter } from "./routers/user-stats"
import { vercelRouter } from "./routers/vercel"
import { router } from "./trpc"

export const appRouter = router({
  map: mapRouter,
  mapList: mapListRouter,
  notification: notificationRouter,
  result: resultRouter,
  userOption: userOptionRouter,
  userProfile: userProfileRouter,
  userStats: userStatsRouter,
  morphConvert: morphConvertRouter,
  gemini: geminiRouter,
  vercel: vercelRouter,
  clap: clapRouter,
  like: likeRouter,
})

export type AppRouter = typeof appRouter
