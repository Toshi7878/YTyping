import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { orpc } from "@/orpc/provider";
import { Badge } from "@/ui/badge";
import { useMapListFilterQueryStates } from "./search-params";

export const MapCountBadge = () => {
  const [params] = useMapListFilterQueryStates();
  const { data: mapListLength, isPending } = useQuery(orpc.map.list.getCount.queryOptions({ input: params }));

  return (
    <Badge variant="accent-light" className="gap-4" size="md">
      <span>譜面数:</span>
      <div className="flex w-6 min-w-6 items-center justify-end">
        {isPending ? <Loader2 className="size-5 animate-spin" /> : mapListLength}
      </div>
    </Badge>
  );
};
