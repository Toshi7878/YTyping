import { useQueryStates } from "nuqs";
import { type MapListSearchParams, mapListSearchParams, mapListSerialize } from "@/lib/search-params/map-list";
import { setIsSearching } from "./atoms";

export const useSetSearchParams = () => {
  const [params] = useQueryStates(mapListSearchParams);

  return (updates?: Partial<MapListSearchParams>) => {
    const mergedParams = { ...params, ...updates };
    const isChanged = JSON.stringify(params) !== JSON.stringify(mergedParams);
    if (!isChanged) return;

    setIsSearching(true);
    window.history.replaceState(null, "", mapListSerialize(mergedParams) || window.location.pathname);
  };
};
