import { useVolumeStateRef } from "@/lib/global-atoms/globalAtoms";
import { useUserAgent } from "@/utils/useUserAgent";
import { sound } from "@pixi/sound";
import { useEffect } from "react";
import { useUserTypingOptionsStateRef } from "../../atoms/stateAtoms";

const manifest = [
  { alias: "type", src: "/wav/key_type.wav" },
  { alias: "miss", src: "/wav/miss_type.wav" },
  { alias: "lineClear", src: "/wav/clear_type.wav" },
];

export const useSoundEffect = () => {
  const readTypingOptions = useUserTypingOptionsStateRef();
  const readVolume = useVolumeStateRef();
  const { isMobile } = useUserAgent();

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
    const volume = (isMobile ? 100 : readVolume()) / 100;
    sound.play("lineClear", { volume });
  };

  const typeSoundPlay = () => {
    const volume = (isMobile ? 100 : readVolume()) / 100;
    sound.play("type", { volume, start: 0.005 });
  };

  const missSoundPlay = () => {
    const volume = (isMobile ? 100 : readVolume()) / 100;
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
