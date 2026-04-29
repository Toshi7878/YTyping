import { toast } from "sonner";
import { getSession } from "@/lib/auth-client";

const ytypingGlobal = {
  get toast() {
    return toast;
  },
  get getSessionUser() {
    return () => getSession()?.user ?? null;
  },
};

declare global {
  interface Window {
    __ytyping: typeof ytypingGlobal;
  }
}

if (typeof window !== "undefined") window.__ytyping = ytypingGlobal;
