import { useQueryStates } from "nuqs";
import { type MapListSearchParams, mapListSearchParams, mapListSerialize } from "@/utils/queries/schema/map-list";
import { useSetIsSearching } from "./atoms";

export const useSetParams = () => {
  const [params] = useQueryStates(mapListSearchParams);
  const setIsSearching = useSetIsSearching();

  return (newParams: Partial<MapListSearchParams>) => {
    const isChanged = JSON.stringify(params) !== JSON.stringify(newParams);
    if (!isChanged) return;

    setIsSearching(true);
    window.history.replaceState(null, "", mapListSerialize(newParams));
  };
};
