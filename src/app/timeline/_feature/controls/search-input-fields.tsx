"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useIsSearching } from "@/shared/result/list/list";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input/input";
import { useResultListFilterQueryStates } from "../search-params";

export const SearchInputs = ({ showUsername = true }: { showUsername?: boolean }) => {
  const t = useTranslations("timeline.search");
  const tCommon = useTranslations("common");
  const isSearching = useIsSearching();
  const [filterParams, setFilterParams] = useResultListFilterQueryStates();
  const [keywords, setKeywords] = useState({
    mapKeyword: filterParams.mapKeyword,
    username: filterParams.username,
  });

  const applyKeywords = () => {
    setFilterParams({ mapKeyword: keywords.mapKeyword.trim(), username: keywords.username.trim() });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyKeywords();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={keywords.mapKeyword}
        type="search"
        placeholder={t("mapKeyword")}
        onChange={(e) => setKeywords((prev) => ({ ...prev, mapKeyword: e.target.value }))}
        onKeyDown={onKeyDown}
      />
      {showUsername && (
        <Input
          value={keywords.username}
          placeholder={t("username")}
          type="search"
          onChange={(e) => setKeywords((prev) => ({ ...prev, username: e.target.value }))}
          onKeyDown={onKeyDown}
        />
      )}
      <Button className="w-[30%]" onClick={applyKeywords} disabled={isSearching} loading={isSearching}>
        {tCommon("search")}
      </Button>
    </div>
  );
};
