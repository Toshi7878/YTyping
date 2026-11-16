import type { Locale } from "./config";
import type ja from "./messages/ja.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof ja;
  }
}
