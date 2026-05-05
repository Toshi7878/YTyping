"use client";
import { useAtomValue } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { toast } from "sonner";
import { getSession } from "@/lib/auth-client";
import { store } from "./store";

const mapLinkModeAtom = atomWithStorage<"type" | "ime">(
  "mapLinkMode",
  "type",
  createJSONStorage(() => sessionStorage),
);
export const useMapLinkMode = () => useAtomValue(mapLinkModeAtom, { store });
export const getMapLinkMode = (): "type" | "ime" => {
  try {
    const stored = sessionStorage.getItem("mapLinkMode");
    const parsed = stored !== null ? JSON.parse(stored) : null;
    return parsed === "ime" ? "ime" : "type";
  } catch {
    return "type";
  }
};
export const setMapLinkMode = (value: "type" | "ime") => store.set(mapLinkModeAtom, value);

const ytypingGlobal = {
  get toast() {
    return toast;
  },
  get getSessionUser() {
    return () => getSession()?.user ?? null;
  },
  get getMapLinkMode() {
    return () => getMapLinkMode();
  },
  get setMapLinkMode() {
    return (mode: "type" | "ime") => setMapLinkMode(mode);
  },
};

declare global {
  interface Window {
    __ytyping: typeof ytypingGlobal;
  }
}

if (typeof window !== "undefined") window.__ytyping = ytypingGlobal;

export function UserScriptInit() {
  return null;
}
