import clearTypeSound from "@/asset/wav/clear_type.wav";
import typeSound from "@/asset/wav/key_type.wav";
import missSound from "@/asset/wav/miss_type.wav";
import { useVolumeAtom } from "@/lib/global-atoms/globalAtoms";
import { sound } from "@pixi/sound";
import { useStore } from "jotai";
import { useEffect } from "react";
import { userOptionsAtom } from "../../type-atoms/gameRenderAtoms";

const manifest = [
  { alias: "type", src: typeSound },
  { alias: "miss", src: missSound },
  { alias: "lineClear", src: clearTypeSound },
];

export const useSoundEffect = () => {
  const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
  const volumeAtom = useVolumeAtom();
  const volume = (isIOS || isAndroid ? 100 : volumeAtom) / 100;

  const typeAtomStore = useStore();

  useEffect(() => {
    manifest.forEach(({ alias, src }) => {
      sound.add(alias, {
        url: src,
        preload: true,
      });
    });
  }, []);

  const clearTypeSoundPlay = () => {
    sound.play("lineClear", { volume });
  };

  const typeSoundPlay = () => {
    sound.play("type", { volume });
  };

  const missSoundPlay = () => {
    sound.play("miss", { volume });
  };

  const triggerTypingSound = ({ isLineCompleted }: { isLineCompleted: boolean }) => {
    const userOptions = typeAtomStore.get(userOptionsAtom);
    if (isLineCompleted) {
      if (userOptions.lineClearSound) {
        clearTypeSoundPlay();
      } else if (userOptions.typeSound) {
        typeSoundPlay();
      }
    } else {
      if (userOptions.typeSound) {
        typeSoundPlay();
      }
    }
  };

  const triggerMissSound = () => {
    const userOptions = typeAtomStore.get(userOptionsAtom);
    if (userOptions.missSound) {
      missSoundPlay();
    }
  };

  return { triggerTypingSound, triggerMissSound, clearTypeSoundPlay, typeSoundPlay, missSoundPlay };
};
