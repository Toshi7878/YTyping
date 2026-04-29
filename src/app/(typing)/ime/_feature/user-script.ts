import { evaluateImeInput } from "lyrics-ime-typing-engine";
import { getSession, type Session } from "@/lib/auth-client";
import { getBuiltMap, getTypingWord } from "../_lib/atoms/state";
import { getImeOptions } from "./provider";

declare global {
  interface Window {
    __ytyping_ime: {
      /** IME 入力を評価する */
      evaluateImeInput: typeof evaluateImeInput;
      /** 現在の typing word（期待ワード・現在ワードインデックス）を取得 */
      getTypingWord: typeof getTypingWord;
      /** IME タイピングオプションを取得 */
      getImeOptions: typeof getImeOptions;
      /** ビルド済みマップ（譜面データ）を取得 */
      getBuiltMap: typeof getBuiltMap;
      /** ログイン中ユーザー情報を取得。未ログイン時は null */
      getSessionUser: () => Session["user"] | null;
    };
  }
}

// SSR 時は window が存在しないため、クライアント側でのみ登録する
if (typeof window !== "undefined")
  window.__ytyping_ime = {
    get evaluateImeInput() {
      return evaluateImeInput;
    },
    get getTypingWord() {
      return getTypingWord;
    },
    get getImeOptions() {
      return getImeOptions;
    },
    get getBuiltMap() {
      return getBuiltMap;
    },
    get getSessionUser() {
      return () => getSession()?.user ?? null;
    },
  };
