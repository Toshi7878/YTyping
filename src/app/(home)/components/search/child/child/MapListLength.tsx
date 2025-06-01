import { useMapListLengthQuery } from "@/util/global-hooks/query/useMapListQuery";
import { Loader2 } from "lucide-react";

const MapListLength = () => {
  const { data: mapListLength, isPending } = useMapListLengthQuery();

  return (
    <div className="bg-accent flex items-center gap-2 rounded-md px-3 py-1 font-medium">
      <span>譜面数:</span>
      <div className="flex w-6 min-w-6 items-center justify-end">
        {isPending ? <Loader2 size="sm" /> : mapListLength}
      </div>
    </div>
  );
};

export default MapListLength;
