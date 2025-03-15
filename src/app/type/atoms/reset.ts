import { RESET } from "jotai/utils";
import { InputModeType } from "../ts/type";
import { useGameRef, useLineStatusRef, useStatusRef, useYTStatusRef } from "./refAtoms";
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
  const { resetGameRef } = useGameRef();
  const { resetYTStatusRef } = useYTStatusRef();
  const { resetLineStatusRef } = useLineStatusRef();
  const { resetStatusRef } = useStatusRef();

  return () => {
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
    resetGameRef();
    resetYTStatusRef();
    resetStatusRef();
    resetLineStatusRef();
  };
};
