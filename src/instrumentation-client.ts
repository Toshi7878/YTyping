// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { env } from "./env";

Sentry.init({
  dsn: "https://2024608e4fc3af09de64700fef818657@o4510090185342976.ingest.us.sentry.io/4510090185539584",
  enabled: env.NODE_ENV === "production",
  tracesSampleRate: 1,
  enableLogs: true,
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
