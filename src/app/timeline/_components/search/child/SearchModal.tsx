"use client";
import {
  useSearchResultClearRateState,
  useSearchResultKpmState,
  useSearchResultSpeedState,
  useSetSearchResultClearRate,
  useSetSearchResultKpm,
  useSetSearchResultSpeed,
} from "@/app/timeline/atoms/atoms";
import { DEFAULT_CLEAR_RATE_SEARCH_RANGE, DEFAULT_KPM_SEARCH_RANGE } from "@/app/timeline/ts/const/consts";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SearchModeRadio from "./child/SearchModeRadio";
import SearchRange from "./child/SearchRange";

const SearchModal = () => {
  const searchKmp = useSearchResultKpmState();
  const searchClearRate = useSearchResultClearRateState();
  const searchSpeed = useSearchResultSpeedState();
  const setSearchKpm = useSetSearchResultKpm();
  const setSearchClearRate = useSetSearchResultClearRate();
  const setSearchSpeed = useSetSearchResultSpeed();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>詳細フィルター</Button>
      </PopoverTrigger>
      <PopoverContent className="bg-card text-card-foreground border-border w-[500px]">
        <div className="space-y-4">
          <SearchModeRadio />
          <SearchRange
            label={"kpm"}
            min={DEFAULT_KPM_SEARCH_RANGE.min}
            max={DEFAULT_KPM_SEARCH_RANGE.max}
            step={10}
            value={searchKmp}
            setValue={setSearchKpm}
          />
          <SearchRange
            label={"% (クリア率)"}
            min={DEFAULT_CLEAR_RATE_SEARCH_RANGE.min}
            max={DEFAULT_CLEAR_RATE_SEARCH_RANGE.max}
            step={1}
            value={searchClearRate}
            setValue={setSearchClearRate}
          />
          <SearchRange label={"倍速"} min={1} max={2} step={0.25} value={searchSpeed} setValue={setSearchSpeed} />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchModal;
