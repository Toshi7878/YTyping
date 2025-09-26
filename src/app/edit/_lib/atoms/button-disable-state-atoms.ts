import { atom, useAtomValue } from "jotai"
import { useAtomCallback } from "jotai/utils"
import { useCallback } from "react"
import { mapReducerAtom } from "./map-reducer-atom"
import { isTimeInputValidAtom, selectLineIndexAtom } from "./state-atoms"
import { getEditAtomStore } from "./store"

const store = getEditAtomStore()

const isNotSelectLineAtom = atom((get) => {
  const selectIndex = get(selectLineIndexAtom)

  return selectIndex === 0 || selectIndex === null
})

const endLineIndexAtom = atom((get) => {
  const map = get(mapReducerAtom)

  return map.findLastIndex((line) => line.lyrics === "end")
})

const isLineLastSelectAtom = atom((get) => {
  const endLineIndex = get(endLineIndexAtom)
  const selectIndex = get(selectLineIndexAtom)

  if (selectIndex === null) {
    return false
  }

  return selectIndex === endLineIndex
})

const isAddButtonDisabledAtom = atom((get) => {
  const isTimeInputValid = get(isTimeInputValidAtom)
  return isTimeInputValid
})

const isUpdateButtonDisabledAtom = atom((get) => {
  const isNotLineSelect = get(isNotSelectLineAtom)
  const isLineLastSelect = get(isLineLastSelectAtom)
  const isTimeInputValid = get(isTimeInputValidAtom)

  return isTimeInputValid || isNotLineSelect || isLineLastSelect
})

const isDeleteButtonDisabledAtom = atom((get) => {
  const isNotSelectLine = get(isNotSelectLineAtom)
  const isSelectLastLine = get(isLineLastSelectAtom)

  return isNotSelectLine || isSelectLastLine
})

export const useIsAddBtnDisabledState = () => useAtomValue(isAddButtonDisabledAtom, { store })
export const useIsAddBtnDisabledStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(isAddButtonDisabledAtom), []),
    { store },
  )
}
export const useIsUpdateBtnDisabledState = () => useAtomValue(isUpdateButtonDisabledAtom, { store })
export const useIsUpdateBtnDisabledStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(isUpdateButtonDisabledAtom), []),
    { store },
  )
}
export const useIsDeleteBtnDisabledState = () => useAtomValue(isDeleteButtonDisabledAtom, { store })
export const useIsDeleteBtnDisabledStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(isDeleteButtonDisabledAtom), []),
    { store },
  )
}

export const useEndLineIndexState = () => useAtomValue(endLineIndexAtom, { store })
