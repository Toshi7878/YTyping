import { atom, type ExtractAtomValue, getDefaultStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, atomWithStorage, createJSONStorage, RESET } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { InputMode } from "lyrics-typing-engine";
import { DEFAULT_USER_OPTIONS } from "@/server/drizzle/schema";
import type { Updater } from "@/utils/types";

const store = getDefaultStore();

const readyRadioInputModeAtom = atomWithStorage<InputMode>("inputMode", "roma");
export const useReadyInputModeState = () => useAtomValue(readyRadioInputModeAtom, { store });
export const setReadyInputMode = (value: InputMode) => store.set(readyRadioInputModeAtom, value);
export const getReadyInputMode = () => store.get(readyRadioInputModeAtom);

const volumeAtom = atomWithStorage("volume", 30, undefined, { getOnInit: true });

export const useVolumeState = () => useAtomValue(volumeAtom, { store });
export const getVolume = () => store.get(volumeAtom);
export const setVolume = (value: number) => store.set(volumeAtom, value);

const previewVideoInfoAtom = atomWithReset<{
  videoId: string | null;
  previewTime: number | null;
  previewSpeed: number | null;
}>({ videoId: null, previewTime: null, previewSpeed: null });
const previewYTPlayerAtom = atomWithReset<YT.Player | null>(null);

export const usePreviewVideoInfoState = () => useAtomValue(previewVideoInfoAtom, { store });
export const getPreviewVideoInfo = () => store.get(previewVideoInfoAtom);
export const setPreviewVideoInfo = (info: ExtractAtomValue<typeof previewVideoInfoAtom>) => {
  store.set(previewVideoInfoAtom, info);

  const { videoId, previewTime } = info;
  if (videoId) {
    const player = getPreviewYTPlayer();
    if (videoId) {
      player?.cueVideoById({ videoId, startSeconds: previewTime ?? 0 });
    }
  }
};
export const resetPreviewVideoInfo = () => {
  store.set(previewVideoInfoAtom, RESET);
  const YTPlayer = getPreviewYTPlayer();
  YTPlayer?.cueVideoById({ videoId: "" });
};

export const usePreviewPlayerState = () => useAtomValue(previewYTPlayerAtom, { store });
export const getPreviewYTPlayer = () => store.get(previewYTPlayerAtom);
export const setPreviewYTPlayer = (newYTPlayer: YT.Player) => store.set(previewYTPlayerAtom, newYTPlayer);
export const resetPreviewYTPlayer = () => store.set(previewYTPlayerAtom, RESET);

export interface ActiveUserStatus {
  id: number;
  name: string;
  onlineAt: Date;
  state: "type" | "edit" | "idle" | "askMe";
  mapId: number | null;
}

const onlineUsersAtom = atom<ActiveUserStatus[]>([]);

export const useOnlineUsersState = () => useAtomValue(onlineUsersAtom, { store });
export const useSetOnlineUsers = () => useSetAtom(onlineUsersAtom, { store });

export const userOptionsAtom = atom(DEFAULT_USER_OPTIONS);
const presenceStateAtom = focusAtom(userOptionsAtom, (optic) => optic.prop("presenceState"));
const mapListLayoutAtom = focusAtom(userOptionsAtom, (optic) => optic.prop("mapListLayout"));
export const usePresenceOptionState = () => useAtomValue(presenceStateAtom, { store });
export const useMapListLayoutTypeState = () => useAtomValue(mapListLayoutAtom, { store });
export const setUserOptions = (update: Updater<ExtractAtomValue<typeof userOptionsAtom>>) =>
  store.set(userOptionsAtom, update);

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
