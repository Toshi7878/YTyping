import type { getSession } from "@/auth/server";
import { HydrateClient, orpc, prefetchAsync } from "@/orpc/server";
import { cn } from "@/utils/cn";
import { LeftNav, RightNav } from "./navs/navs";

interface HeaderProps {
  className: string;
  session: Awaited<ReturnType<typeof getSession>>;
}

export const Header = async ({ className, session }: HeaderProps) => {
  if (session?.user?.id) {
    await prefetchAsync(orpc.ranking.pp.getRankByUserId.queryOptions({ input: session.user.id }));
  }

  return (
    <HydrateClient>
      <header id="header" className={cn("bg-header-background", className)}>
        <nav className="mx-4 flex items-center justify-between pt-px md:mx-10 lg:mx-36">
          <LeftNav />
          <RightNav />
        </nav>
      </header>
    </HydrateClient>
  );
};
