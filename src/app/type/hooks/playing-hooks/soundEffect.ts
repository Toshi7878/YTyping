import { IS_ANDROID, IS_IOS } from "@/config/consts/globalConst";
import { useVolumeStateRef } from "@/lib/global-atoms/globalAtoms";
import clearTypeSound from "@/public/wav/clear_type.wav";
import typeSound from "@/public/wav/key_type.wav";
import missSound from "@/public/wav/miss_type.wav";
import { sound } from "@pixi/sound";
import { useEffect } from "react";
import { useUserTypingOptionsStateRef } from "../../atoms/stateAtoms";

const manifest = [
  { alias: "type", src: typeSound },
  { alias: "miss", src: missSound },
  { alias: "lineClear", src: clearTypeSound },
];

export const useSoundEffect = () => {
  const readTypingOptions = useUserTypingOptionsStateRef();
  const readVolume = useVolumeStateRef();

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
    const volume = (IS_IOS || IS_ANDROID ? 100 : readVolume()) / 100;
    sound.play("lineClear", { volume });
  };

  const typeSoundPlay = () => {
    const volume = (IS_IOS || IS_ANDROID ? 100 : readVolume()) / 100;
    sound.play("type", { volume, start: 0.005 });
  };

  const missSoundPlay = () => {
    const volume = (IS_IOS || IS_ANDROID ? 100 : readVolume()) / 100;
    sound.play("miss", { volume });
  };

  const iosActiveSound = () => {
    sound.play("lineClear", { volume: 0 });
    sound.play("type", { volume: 0 });
    sound.play("miss", { volume: 0 });
  };
  const triggerTypingSound = ({ isCompleted }: { isCompleted: boolean }) => {
    const typingOptions = readTypingOptions();

    if (isCompleted) {
      if (typingOptions.line_clear_sound) {
        clearTypeSoundPlay();
      } else if (typingOptions.type_sound) {
        typeSoundPlay();
      }
    } else {
      if (typingOptions.type_sound) {
        typeSoundPlay();
      }
    }
  };

  const triggerMissSound = () => {
    if (readTypingOptions().miss_sound) {
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
