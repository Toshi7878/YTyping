"use client";
import { getQueryClient, getTRPCOptions } from "@/trpc/provider";
import { getBuiltMap } from "../_lib/atoms/state";
import { handleImeInput } from "./input-textarea";
import { getUserResult, getUserResults, updateUserName, updateUserResult } from "./memu/result-dialog";
import { addNotifications } from "./notifications";
import { getMapId } from "./provider";

type ImeEventMap = {
  start: undefined;
  end: undefined;
};
type ImeEventType = keyof ImeEventMap;
type ImeEventCallback<T extends ImeEventType> = (detail: ImeEventMap[T]) => void;

const eventListeners = new Map<ImeEventType, Set<ImeEventCallback<ImeEventType>>>();

export const dispatchImeEvent = <T extends ImeEventType>(type: T) => {
  eventListeners.get(type)?.forEach((cb) => {
    cb(undefined as ImeEventMap[T]);
  });
};

const ensureMapInfo = async () => {
  const mapId = getMapId();
  if (mapId === null) return null;
  const trpc = getTRPCOptions();
  const queryClient = getQueryClient();
  const map = await queryClient.ensureQueryData(trpc.map.getById.queryOptions({ mapId }));
  return map;
};

const ytypingIme = {
  get ensureMapInfo() {
    return ensureMapInfo;
  },
  get getBuiltMap() {
    return getBuiltMap;
  },
  get getUserResults() {
    return getUserResults;
  },
  get getUserResult() {
    return getUserResult;
  },
  get updateUserResult() {
    return updateUserResult;
  },
  get updateUserName() {
    return updateUserName;
  },
  get handleImeInput() {
    return handleImeInput;
  },
  get addNotifications() {
    return addNotifications;
  },
  addEventListener<T extends ImeEventType>(type: T, callback: ImeEventCallback<T>) {
    const listeners = eventListeners.get(type) ?? new Set<ImeEventCallback<ImeEventType>>();
    listeners.add(callback as ImeEventCallback<ImeEventType>);
    eventListeners.set(type, listeners);
  },
  removeEventListener<T extends ImeEventType>(type: T, callback: ImeEventCallback<T>) {
    eventListeners.get(type)?.delete(callback as ImeEventCallback<ImeEventType>);
  },
};

declare global {
  interface Window {
    __ytyping_ime: typeof ytypingIme;
  }
}

// SSR 時は window が存在しないため、クライアント側でのみ登録する
if (typeof window !== "undefined") window.__ytyping_ime = ytypingIme;

export type YTypingImeAPI = typeof ytypingIme;

export function UserScriptInit() {
  return null;
}
