import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useSetIsSearching } from "../atoms/atoms";
import { useSetSearchParams } from "./useSetSearchParams";

export const useSearchKeydown = () => {
  const searchParams = useSearchParams();
  const rangeParams = useSetSearchParams();
  const router = useRouter();
  const setIsSearching = useSetIsSearching();

  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams(searchParams.toString());

      const newParams = rangeParams(params);
      if (newParams.toString() !== searchParams.toString()) {
        setIsSearching(true);
        router.replace(`?${newParams.toString()}`);
      }
    }
  };
};

export default useSearchKeydown;
