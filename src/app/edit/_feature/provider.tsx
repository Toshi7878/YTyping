"use client";
import { createStore, type ExtractAtomValue, Provider, useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import type React from "react";
import { useEffect } from "react";
import { AtomsHydrator } from "@/lib/jotai-hydrator";
import { pathChangeAtomReset } from "./reset";

export const store = createStore();

export const mapIdAtom = atomWithReset<number | null>(null);
export const useMapId = () => useAtomValue(mapIdAtom, { store });
export const getMapId = () => store.get(mapIdAtom);
export const setMapId = (value: ExtractAtomValue<typeof mapIdAtom>) => store.set(mapIdAtom, value);

export const creatorIdAtom = atomWithReset<number | null>(null);
export const useCreatorId = () => useAtomValue(creatorIdAtom, { store });
export const setCreatorId = (value: ExtractAtomValue<typeof creatorIdAtom>) => store.set(creatorIdAtom, value);

const videoIdAtom = atomWithReset("");
export const useVideoId = () => useAtomValue(videoIdAtom, { store });
export const getVideoId = () => store.get(videoIdAtom);
export const setVideoId = (value: string) => store.set(videoIdAtom, value);

interface JotaiProviderProps {
  mapId?: string;
  videoId: string;
  creatorId?: number;
  children: React.ReactNode;
}
export const JotaiProvider = ({ mapId, videoId, creatorId, children }: JotaiProviderProps) => {
  useEffect(() => {
    setMapId(mapId ? Number(mapId) : null);
    setCreatorId(creatorId ? creatorId : null);
    setVideoId(videoId);
    return () => {
      pathChangeAtomReset();
    };
  }, [mapId, videoId, creatorId]);

  return (
    <Provider store={store}>
      <AtomsHydrator
        atomValues={[
          ...(mapId ? [[mapIdAtom, mapId ? Number(mapId) : null] as const] : []),
          ...(creatorId ? [[creatorIdAtom, creatorId] as const] : []),
          [videoIdAtom, videoId],
        ]}
      >
        {children}
      </AtomsHydrator>
    </Provider>
  );
};
