import React, { useEffect, useRef, useState } from "react";
import { Button, Card, CardBody, useTheme } from "@chakra-ui/react";
import SearchRange from "./child/SearchRange";
import {
  DEFAULT_CLEAR_RATE_SEARCH_RANGE,
  DEFAULT_KPM_SEARCH_RANGE,
} from "@/app/timeline/ts/const/consts";
import SearchModeRadio from "./child/SearchModeRadio";
import { ThemeColors } from "@/types";
import {
  useSearchResultClearRateAtom,
  useSearchResultKpmAtom,
  useSearchResultSpeedAtom,
  useSetSearchResultClearRateAtom,
  useSetSearchResultKpmAtom,
  useSetSearchResultSpeedAtom,
} from "@/app/timeline/atoms/atoms";

const SearchCard = () => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const theme: ThemeColors = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const searchKpm = useSearchResultKpmAtom();
  const searchClearRate = useSearchResultClearRateAtom();
  const searchSpeed = useSearchResultSpeedAtom();
  const setSearchKpm = useSetSearchResultKpmAtom();
  const setSearchClearRate = useSetSearchResultClearRateAtom();
  const setSearchSpeed = useSetSearchResultSpeedAtom();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsCardVisible(false);
      }
    };

    if (isCardVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCardVisible]);

  return (
    <>
      <Button onClick={() => setIsCardVisible(!isCardVisible)}>詳細フィルター</Button>

      {isCardVisible && (
        <Card
          ref={cardRef}
          position="absolute"
          zIndex={4}
          width={"500px"}
          mt={5}
          bg={theme.colors.background.body}
          color={theme.colors.text.body}
          border="1px"
          borderColor={theme.colors.border.card}
        >
          <CardBody>
            <SearchModeRadio />
            <SearchRange
              label={"kpm"}
              min={DEFAULT_KPM_SEARCH_RANGE.min}
              max={DEFAULT_KPM_SEARCH_RANGE.max}
              step={10}
              value={searchKpm}
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
            <SearchRange
              label={"倍速"}
              min={1}
              max={2}
              step={0.25}
              value={searchSpeed}
              setValue={setSearchSpeed}
            />
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default SearchCard;
