"use client";
import { toast } from "sonner";
import { getSession } from "@/auth/client";
import { setTypingLinkMode } from "@/store/typing-link-mode";

const ytypingGlobal = {
  get toast() {
    return toast;
  },
  get getSessionUser() {
    return () => getSession()?.user ?? null;
  },
  get setTypingLinkMode() {
    return (mode: "type" | "ime") => setTypingLinkMode(mode);
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
