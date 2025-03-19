import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/api/trpc";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";

export const serverApi = createCallerFactory(appRouter)(async () => {
  const session = await auth();

  const user = { ...session?.user, id: Number(session?.user.id) };
  return {
    db: prisma,
    user,
  };
});
