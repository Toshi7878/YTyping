import clearTypeSound from "@/asset/wav/clear_type.wav";
import typeSound from "@/asset/wav/key_type.wav";
import missSound from "@/asset/wav/miss_type.wav";
import { IS_ANDROID, IS_IOS } from "@/config/consts/globalConst";
import { useVolumeAtom } from "@/lib/global-atoms/globalAtoms";
import { sound } from "@pixi/sound";
import { useEffect } from "react";
import { useUserOptionsAtom } from "../../type-atoms/gameRenderAtoms";

const manifest = [
  { alias: "type", src: typeSound },
  { alias: "miss", src: missSound },
  { alias: "lineClear", src: clearTypeSound },
];

export const useSoundEffect = () => {
  const userOptions = useUserOptionsAtom();
  const volumeAtom = useVolumeAtom();
  const volume = (IS_IOS || IS_ANDROID ? 100 : volumeAtom) / 100;

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

  const clearTypeSoundPlay = () => {
    sound.play("lineClear", { volume });
  };

  const typeSoundPlay = () => {
    sound.play("type", { volume });
  };

  const missSoundPlay = () => {
    sound.play("miss", { volume });
  };

  const iosActiveSound = () => {
    sound.play("lineClear", { volume: 0 });
    sound.play("type", { volume: 0 });
    sound.play("miss", { volume: 0 });
  };
  const triggerTypingSound = ({ isLineCompleted }: { isLineCompleted: boolean }) => {
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
