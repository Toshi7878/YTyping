import clearTypeSound from "@/asset/wav/clear_type.wav";
import typeSound from "@/asset/wav/key_type.wav";
import missSound from "@/asset/wav/miss_type.wav";
import { IS_ANDROID, IS_IOS } from "@/config/global-consts";
import { getGlobalAtomStore, volumeAtom } from "@/lib/global-atoms/globalAtoms";
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

  const globalAtomStore = getGlobalAtomStore();
  const typeAtomStore = useStore();

  useEffect(() => {
    manifest.forEach(({ alias, src }) => {
      if (!sound.exists(alias)) {
        sound.add(alias, {
          url: src,
          preload: true,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calcVolume = () => {

    const volume = (IS_IOS || IS_ANDROID? 100 : globalAtomStore.get(volumeAtom)) / 100;

    return volume
  }
  const clearTypeSoundPlay = () => {
    const volume = calcVolume()
    sound.play("lineClear", { volume });
  };

  const typeSoundPlay = () => {
    const volume = calcVolume()

    sound.play("type", { volume });
  };

  const missSoundPlay = () => {
    const volume = calcVolume()

    sound.play("miss", { volume });
  };

  const iosActiveSound = () => {
    sound.play("lineClear", { volume: 0 });
    sound.play("type", { volume: 0 });
    sound.play("miss", { volume: 0 });
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

  return {
    iosActiveSound,
    triggerTypingSound,
    triggerMissSound,
    clearTypeSoundPlay,
    typeSoundPlay,
    missSoundPlay,
  };
};
