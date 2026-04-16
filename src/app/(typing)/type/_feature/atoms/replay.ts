import { type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import type { RouterOutputs } from "@/server/api/trpc";
import { getTypingGameAtomStore } from "./store";

const store = getTypingGameAtomStore();
const replayRankingResultAtom = atomWithReset<RouterOutputs["result"]["list"]["getRanking"][number] | null>(null);

export const useReplayRankingResultState = () => useAtomValue(replayRankingResultAtom);
export const getReplayRankingResult = () => store.get(replayRankingResultAtom);
export const setReplayRankingResult = (value: ExtractAtomValue<typeof replayRankingResultAtom>) =>
  store.set(replayRankingResultAtom, value);
export const resetReplayRankingResult = () => store.set(replayRankingResultAtom, RESET);
