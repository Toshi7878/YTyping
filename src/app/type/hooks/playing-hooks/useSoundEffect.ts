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
const soundInstances = new Map();

export const useSoundEffect = () => {
  const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
  const volumeAtom = useVolumeAtom();
  const volume = (isIOS || isAndroid ? 100 : volumeAtom) / 100;

  const typeAtomStore = useStore();

  useEffect(() => {
    // 一度だけ初期化
    if (soundInstances.size === 0) {
      manifest.forEach(({ alias, src }) => {
        sound.add(alias, src);
        // プリロードしてインスタンスを保持
        const instance = sound.find(alias);
        soundInstances.set(alias, instance);
      });
    }

    // クリーンアップ
    return () => {
      if (soundInstances.size > 0) {
        soundInstances.forEach((instance) => instance.destroy());
        soundInstances.clear();
      }
    };
  }, []);

  const clearTypeSoundPlay = () => {
    const instance = soundInstances.get("lineClear");
    if (instance) instance.play({ volume });
  };

  const typeSoundPlay = () => {
    const instance = soundInstances.get("type");
    if (instance) instance.play({ volume });
  };

  const missSoundPlay = () => {
    const instance = soundInstances.get("miss");
    if (instance) instance.play({ volume });
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
