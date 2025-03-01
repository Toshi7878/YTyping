import { useRouter } from "next/navigation";
import {
  useSearchResultClearRateAtom,
  useSearchResultKeyWordsAtom,
  useSearchResultKpmAtom,
  useSearchResultModeAtom,
  useSearchResultSpeedAtom,
} from "../atoms/atoms";

export const useSearchReload = () => {
  const searchKeywords = useSearchResultKeyWordsAtom();

  const searchKpm = useSearchResultKpmAtom();
  const searchClearRate = useSearchResultClearRateAtom();
  const searchSpeed = useSearchResultSpeedAtom();
  const searchMode = useSearchResultModeAtom();
  const router = useRouter();

  return () => {
    router.push(
      `/timeline?mode=${searchMode}&user-keyword=${searchKeywords.userName}
&map-keyword=${searchKeywords.mapKeyWord}
&min-kpm=${searchKpm.minValue}&max-kpm=${searchKpm.maxValue}
&min-clear-rate=${searchClearRate.minValue}&max-clear-rate=${searchClearRate.maxValue}
&min-speed=${searchSpeed.minValue}&max-speed=${searchSpeed.maxValue}`,
    );
  };
};
