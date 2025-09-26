import { atom, useSetAtom } from "jotai"
import { useAtomCallback } from "jotai/utils"
import { useCallback } from "react"
import { getEditAtomStore } from "./store"

const store = getEditAtomStore()

export const timeInputAtom = atom<HTMLInputElement | null>(null)

export const useTimeInput = () => {
  const readTime = useAtomCallback(
    useCallback((get) => {
      const input = get(timeInputAtom) as HTMLInputElement
      return input.value
    }, []),
    { store },
  )
  const setTime = useAtomCallback(
    useCallback((get, _set, newValue: number | string | null) => {
      const timeInput = get(timeInputAtom) as HTMLInputElement

      timeInput.value = newValue === null ? "" : String(newValue)
    }, []),
    { store },
  )

  const writeTimeInput = useAtomCallback(
    useCallback((_get, set, timeInput: HTMLInputElement) => {
      set(timeInputAtom, timeInput)
    }, []),
    { store },
  )

  return { readTime, setTime, writeTimeInput }
}

export const playerAtom = atom<YT.Player | null>(null)

export const usePlayer = () => {
  const readPlayer = useAtomCallback(
    useCallback((get) => get(playerAtom) as YT.Player, []),
    { store },
  )

  const writePlayer = useAtomCallback(
    useCallback((_get, set, player: YT.Player) => {
      set(playerAtom, player)
    }, []),
    { store },
  )

  return { readPlayer, writePlayer }
}

export const preventEditorTabAutoFocusAtom = atom<boolean>(false)

export const usePreventEditortabAutoFocus = () =>
  useAtomCallback(
    useCallback((get, set) => {
      setTimeout(() => set(preventEditorTabAutoFocusAtom, false))
      return get(preventEditorTabAutoFocusAtom)
    }, []),
    { store },
  )
export const useSetPreventEditortabAutoFocus = () => useSetAtom(preventEditorTabAutoFocusAtom, { store })
