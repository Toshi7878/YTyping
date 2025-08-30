import { $Enums } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: $Enums.role;
      email_hash: string;
    } & DefaultSession["user"];
  }
}
