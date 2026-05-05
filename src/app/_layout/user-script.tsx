"use client";
import { toast } from "sonner";
import { getSession } from "@/lib/auth-client";
import { getMapLinkMode, setMapLinkMode } from "@/store/map-link-type";

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
