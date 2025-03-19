import { appRouter } from "@/server/api/root";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = async (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const session = await auth();
      return {
        db: prisma,
        user: { ...session?.user, id: Number(session?.user.id ?? 0) },
      };
    },
  });

export { handler as GET, handler as POST };
