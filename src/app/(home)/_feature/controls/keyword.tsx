"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useIsSearching } from "@/shared/map/list/list";
import { useTRPC } from "@/trpc/provider";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/ui/popover";
import { cn } from "@/utils/cn";
import { useDebounce } from "@/utils/hooks/use-debounce";
import { useMapListFilterQueryStates } from "./search-params";

const DEFAULT_TAG_SUGGESTIONS = [
  "J-POP",
  "アニメ",
  "ボーカロイド/ボカロ/VOCALOID/初音ミク",
  "VTuber/ホロライブ/にじさんじ",
  "Cover/歌ってみた",
  "映画",
  "TikTok",
  "OSU/音ゲー",
  "Nightcore/Remix",
  "東方",
  "ラップ",
] as const;

export const KeywordInput = () => {
  const [params, setFilterParams] = useMapListFilterQueryStates();
  const [keyword, setKeyword] = useState(params.keyword ?? "");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const isSearching = useIsSearching();
  const { debounce } = useDebounce(200);
  const trpc = useTRPC();
  const router = useRouter();
  const hasInputKeyword = keyword.trim() !== "";
  const hasDebouncedKeyword = debouncedKeyword.trim() !== "";

  useEffect(() => {
    setKeyword(params.keyword ?? "");
  }, [params.keyword]);

  const { data: suggestions } = useQuery(
    trpc.map.list.getSearchSuggestions.queryOptions(
      { keyword: debouncedKeyword },
      { enabled: hasDebouncedKeyword, staleTime: Infinity },
    ),
  );

  const displaySuggestions = useMemo(
    () =>
      hasInputKeyword
        ? suggestions
        : {
            tags: DEFAULT_TAG_SUGGESTIONS.map((name) => ({ name })),
            titles: [],
          },
    [hasInputKeyword, suggestions],
  );

  const flatSuggestions = useMemo(
    () => [
      ...(displaySuggestions?.tags.map(({ name }) => name) ?? []),
      ...(displaySuggestions?.titles.map(({ title }) => title) ?? []),
    ],
    [displaySuggestions],
  );

  const hasAnySuggestion = flatSuggestions.length > 0;

  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedKeyword]);

  const handleChange = (value: string) => {
    setKeyword(value);
    setOpen(true);
    debounce(() => setDebouncedKeyword(value));
  };

  const handleSelect = (value: string) => {
    setKeyword(value);
    void setFilterParams({ keyword: value });
    setOpen(false);
    setSelectedIndex(-1);
  };

  const handleTitleSelect = (title: string) => {
    const id = displaySuggestions?.titles.find((t) => t.title === title)?.id;
    if (id !== undefined) {
      router.push(`/type/${id}`);
      setOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !hasAnySuggestion) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i >= flatSuggestions.length - 1 ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i <= -1 ? flatSuggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setSelectedIndex(-1);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selected = flatSuggestions[selectedIndex];
      if (!selected) return;
      const isTitleRange = selectedIndex >= tagCount;
      if (isTitleRange) handleTitleSelect(selected);
      else handleSelect(selected);
    }
  };

  const tagCount = displaySuggestions?.tags.length ?? 0;

  return (
    <form
      className="flex select-none items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        void setFilterParams({ keyword: keyword.trim() });
        setOpen(false);
        setSelectedIndex(-1);
      }}
    >
      <Popover open={open && hasAnySuggestion} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <Input
            value={keyword}
            placeholder="キーワードを入力"
            type="search"
            aria-label="検索キーワード"
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
          />
        </PopoverAnchor>
        <PopoverContent align="start" className="p-1" style={{ width: "var(--radix-popper-anchor-width)" }}>
          <SuggestionSection
            items={displaySuggestions?.tags.map(({ name }) => ({ value: name })) ?? []}
            onSelect={handleSelect}
            startIndex={0}
            selectedIndex={selectedIndex}
          />
          <SuggestionSection
            label="譜面"
            items={
              displaySuggestions?.titles.map(({ id, title, artistName }) => ({
                value: title,
                sub: `#${id}`,
                description: artistName ?? undefined,
              })) ?? []
            }
            onSelect={handleTitleSelect}
            startIndex={tagCount}
            selectedIndex={selectedIndex}
          />
        </PopoverContent>
      </Popover>

      <Button className="w-20 md:w-60" loading={isSearching} type="submit" aria-label="検索を実行">
        {isSearching ? "検索中" : "検索"}
      </Button>
    </form>
  );
};

interface SuggestionItem {
  value: string;
  sub?: string;
  description?: string;
}

const SuggestionSection = ({
  label,
  items,
  onSelect,
  startIndex,
  selectedIndex,
}: {
  label?: string;
  items: SuggestionItem[];
  onSelect: (value: string) => void;
  startIndex: number;
  selectedIndex: number;
}) => {
  if (items.length === 0) return null;

  return (
    <div>
      {label && <p className="px-2 py-1 text-muted-foreground text-xs">{label}</p>}
      <ul>
        {items.map(({ value, sub, description }, i) => (
          <li key={value}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent",
                startIndex + i === selectedIndex && "bg-accent",
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(value);
              }}
            >
              <span className="flex min-w-0 flex-col items-start">
                <span className="truncate">{value}</span>
                {description && <span className="truncate text-muted-foreground text-xs">{description}</span>}
              </span>
              {sub && <span className="shrink-0 text-muted-foreground text-xs">{sub}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
