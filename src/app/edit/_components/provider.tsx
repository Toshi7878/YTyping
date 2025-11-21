"use client";
import { Provider } from "jotai";
import type React from "react";
import { useEffect } from "react";
import { AtomsHydrator } from "@/components/shared/jotai";
import { creatorIdAtom, mapIdAtom, setCreatorId, setMapId, setVideoId, videoIdAtom } from "../_lib/atoms/hydrate";
import { pathChangeAtomReset } from "../_lib/atoms/reset";
import { getEditAtomStore } from "../_lib/atoms/store";

interface JotaiProviderProps {
  mapId?: string;
  videoId: string;
  creatorId?: number;
  children: React.ReactNode;
}
export const JotaiProvider = ({ mapId, videoId, creatorId, children }: JotaiProviderProps) => {
  const store = getEditAtomStore();

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
