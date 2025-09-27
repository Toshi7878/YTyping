import { useSearchParams } from "next/navigation";
import type React from "react";
import { useSetIsSearching } from "../atoms";
import { useSetSearchParams } from "./use-set-search-params";

export const useSearchKeydown = () => {
  const searchParams = useSearchParams();
  const rangeParams = useSetSearchParams();
  const setIsSearching = useSetIsSearching();

  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams(searchParams.toString());

      const newParams = rangeParams(params);
      if (newParams.toString() !== searchParams.toString()) {
        setIsSearching(true);
        window.history.replaceState(null, "", `?${newParams.toString()}`);
      }
    }
  };
};
