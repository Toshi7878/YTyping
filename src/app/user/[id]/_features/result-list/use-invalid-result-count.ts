import { skipToken, useQuery } from "@tanstack/react-query";
import { useSession } from "@/auth/client";
import { orpc } from "@/orpc/provider";

/** 確認が必要な記録の件数。本人と管理者以外には取得できないため 0 を返す */
export const useInvalidResultCount = (userId: string) => {
  const { data: session } = useSession();
  const playerId = Number(userId);
  const canView = session?.user.role === "ADMIN" || session?.user.id === playerId;

  const { data: count } = useQuery(
    orpc.result.list.getCount.queryOptions({
      input: canView ? { playerId, invalidOnly: true } : skipToken,
    }),
  );
  return count ?? 0;
};
