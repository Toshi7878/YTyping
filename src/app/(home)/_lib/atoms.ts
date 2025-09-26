import { atom, createStore, useAtomValue, useSetAtom } from "jotai"
import { atomWithReset } from "jotai/utils"
import { DIFFICULTY_RANGE } from "./const"

const store = createStore()
export const getHomeAtomStore = () => store

export const difficultyRangeAtom = atomWithReset(DIFFICULTY_RANGE)
export const useReadDifficultyRange = () => () => store.get(difficultyRangeAtom)
export const useDifficultyRangeState = () => useAtomValue(difficultyRangeAtom, { store })
export const useSetDifficultyRange = () => useSetAtom(difficultyRangeAtom, { store })

const isSearchingAtom = atom(false)
export const useIsSearchingState = () => useAtomValue(isSearchingAtom, { store })
export const useSetIsSearching = () => useSetAtom(isSearchingAtom, { store })
