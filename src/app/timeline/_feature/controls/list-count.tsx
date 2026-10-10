import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { orpc } from "@/orpc/provider";
import { Badge } from "@/ui/badge";
import { useResultListFilterQueryStates } from "../search-params";

export const ResultCountBadge = () => {
  const [params] = useResultListFilterQueryStates();
  const { data: resultCount, isPending } = useQuery(orpc.result.list.getCount.queryOptions({ input: params }));

  return (
    <Badge variant="accent-light" className="gap-4" size="md">
      <span>登録数:</span>
      <div className="flex w-10 min-w-10 items-center justify-end">
        {isPending ? <Loader2 className="size-5 animate-spin" /> : resultCount}
      </div>
    </Badge>
  );
};
