import { useStore } from "jotai";
import { RESET } from "jotai/utils";
import { InputModeType } from "../ts/type";
import {
  gameStateRefAtom,
  lineTypingStatusRefAtom,
  typingStatusRefAtom,
  ytStateRefAtom,
} from "./refAtoms";
import {
  useSetChangeCSSCountAtom,
  useSetComboAtom,
  useSetLineResultsAtom,
  useSetLineSelectIndexAtom,
  useSetMapAtom,
  useSetPlayingInputModeAtom,
  useSetPlayingNotifyAtom,
  useSetPlaySpeedAtom,
  useSetRankingScoresAtom,
  useSetSceneAtom,
  useSetTimeOffsetAtom,
  useSetTypingStatusAtoms,
} from "./stateAtoms";

export const usePathChangeAtomReset = () => {
  const setMap = useSetMapAtom();
  const setScene = useSetSceneAtom();
  const setRankingScores = useSetRankingScoresAtom();
  const setSpeedData = useSetPlaySpeedAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const setLineResults = useSetLineResultsAtom();
  const setLineSelectIndex = useSetLineSelectIndexAtom();
  const setTimeOffset = useSetTimeOffsetAtom();
  const { resetTypingStatus } = useSetTypingStatusAtoms();
  const setCombo = useSetComboAtom();
  const setChangeCSSCount = useSetChangeCSSCountAtom();
  const setPlayingInputMode = useSetPlayingInputModeAtom();
  const typeAtomStore = useStore();

  return () => {
    typeAtomStore.set(ytStateRefAtom, RESET);
    typeAtomStore.set(gameStateRefAtom, RESET);
    typeAtomStore.set(typingStatusRefAtom, RESET);
    typeAtomStore.set(lineTypingStatusRefAtom, RESET);

    setMap(RESET);
    setScene(RESET);
    setNotify(RESET);
    setLineResults(RESET);
    setLineSelectIndex(RESET);
    setTimeOffset(RESET);
    setRankingScores(RESET);
    setSpeedData(RESET);
    setCombo(RESET);
    setChangeCSSCount(RESET);
    setPlayingInputMode((localStorage.getItem("inputMode") as InputModeType) || "roma");
    resetTypingStatus();
  };
};
