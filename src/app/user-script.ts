import { toast } from "sonner";
import { getSession, type Session } from "@/lib/auth-client";

declare global {
  interface Window {
    __ytyping: {
      /** sonner の toast 関数（success / error / info / warning / loading 等を含む） */
      toast: typeof toast;
      /** ログイン中ユーザー情報を取得。未ログイン時は null */
      getSessionUser: () => Session["user"] | null;
    };
  }
}

if (typeof window !== "undefined")
  window.__ytyping = {
    get toast() {
      return toast;
    },
    get getSessionUser() {
      return () => getSession()?.user ?? null;
    },
  };
