import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "@/trpc/provider";
import { useMapListFilterQueryStates } from "./search-params";

export const MapCountBadge = () => {
  const trpc = useTRPC();
  const [params] = useMapListFilterQueryStates();
  const { data: mapListLength, isPending } = useQuery(trpc.map.list.getCount.queryOptions(params));

  return (
    <Badge variant="accent-light" className="gap-4" size="md">
      <span>譜面数:</span>
      <div className="flex w-6 min-w-6 items-center justify-end">
        {isPending ? <Loader2 className="size-5 animate-spin" /> : mapListLength}
      </div>
    </Badge>
  );
};
