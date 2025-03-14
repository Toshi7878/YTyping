import { IS_ANDROID, IS_IOS } from "@/config/consts/globalConst";
import { useVolumeAtom } from "@/lib/global-atoms/globalAtoms";
import clearTypeSound from "@/public/wav/clear_type.wav";
import typeSound from "@/public/wav/key_type.wav";
import missSound from "@/public/wav/miss_type.wav";
import { sound } from "@pixi/sound";
import { useEffect } from "react";
import { useUserTypingOptionsAtom } from "../../atoms/stateAtoms";

const manifest = [
  { alias: "type", src: typeSound },
  { alias: "miss", src: missSound },
  { alias: "lineClear", src: clearTypeSound },
];

export const useSoundEffect = () => {
  const userOptions = useUserTypingOptionsAtom();
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
  const triggerTypingSound = ({ isCompleted }: { isCompleted: boolean }) => {
    if (isCompleted) {
      if (userOptions.line_clear_sound) {
        clearTypeSoundPlay();
      } else if (userOptions.type_sound) {
        typeSoundPlay();
      }
    } else {
      if (userOptions.type_sound) {
        typeSoundPlay();
      }
    }
  };

  const triggerMissSound = () => {
    if (userOptions.miss_sound) {
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
