import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/api/trpc";
import { prisma } from "@/server/db";

export const serverApi = createCallerFactory(appRouter)({
  db: prisma,
  user: { id: 0 },
});
