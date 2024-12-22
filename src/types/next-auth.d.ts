import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      email_hash: string;
    } & DefaultSession["user"];
  }
}

export type AuthProvider = "discord" | "google";
