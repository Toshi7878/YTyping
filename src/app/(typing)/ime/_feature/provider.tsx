"use client";
import { atom, createStore, type ExtractAtomValue, Provider, useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { ReactNode } from "react";
import { AtomsHydrator } from "@/components/shared/jotai";
import type { RouterOutputs } from "@/server/api/trpc";
import { DEFAULT_IME_OPTIONS } from "@/server/drizzle/schema";

export const store = createStore();

const mapIdAtom = atom<number | null>(null);
export const getMapId = () => store.get(mapIdAtom);
export const resetMapId = () => store.set(mapIdAtom, null);

const imeTypeOptionsAtom = atomWithReset(DEFAULT_IME_OPTIONS);
const enableNextLyricsOptionAtom = focusAtom(imeTypeOptionsAtom, (optic) => optic.prop("enableNextLyrics"));
const enableLargeVideoDisplayAtom = focusAtom(imeTypeOptionsAtom, (optic) => optic.prop("enableLargeVideoDisplay"));

let _isImeTypeOptionsEdited = false;
export const isImeTypeOptionsEdited = () => _isImeTypeOptionsEdited;
export const resetIsImeTypeOptionsEdited = () => {
  _isImeTypeOptionsEdited = false;
};

export const useImeOptionsState = () => useAtomValue(imeTypeOptionsAtom, { store });
export const getImeOptions = () => store.get(imeTypeOptionsAtom);

export const useEnableNextLyricsOptionState = () => useAtomValue(enableNextLyricsOptionAtom, { store });
export const useEnableLargeVideoDisplayState = () => useAtomValue(enableLargeVideoDisplayAtom, { store });
export const setImeOptions = (newOptions: Partial<ExtractAtomValue<typeof imeTypeOptionsAtom>>) => {
  store.set(imeTypeOptionsAtom, (prev) => ({
    ...prev,
    ...newOptions,
  }));
  _isImeTypeOptionsEdited = true;
};

interface JotaiProviderProps {
  children: ReactNode;
  userImeTypingOptions: RouterOutputs["user"]["imeTypingOption"]["getForSession"];
  mapId: number;
}

export const JotaiProvider = ({ children, userImeTypingOptions, mapId }: JotaiProviderProps) => {
  return (
    <Provider store={store}>
      <AtomsHydrator
        atomValues={[
          ...(userImeTypingOptions ? [[imeTypeOptionsAtom, userImeTypingOptions] as const] : []),
          [mapIdAtom, mapId],
        ]}
        dangerouslyForceHydrate
      >
        {children}
      </AtomsHydrator>
    </Provider>
  );
};
