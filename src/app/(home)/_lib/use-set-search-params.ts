import {
  type MapListFilterSearchParams,
  type MapListSortSearchParams,
  mapListSerialize,
  useMapListFilterQueryStates,
} from "@/lib/search-params/map-list";
import { setIsSearching } from "./atoms";

export const useSetSearchParams = () => {
  const [params] = useMapListFilterQueryStates();

  return (updates?: Partial<MapListFilterSearchParams & { sort: MapListSortSearchParams }>) => {
    const mergedParams = { ...params, ...updates };
    const isChanged = JSON.stringify(params) !== JSON.stringify(mergedParams);
    if (!isChanged) return;

    setIsSearching(true);
    window.history.replaceState(null, "", mapListSerialize(mergedParams) || window.location.pathname);
  };
};
