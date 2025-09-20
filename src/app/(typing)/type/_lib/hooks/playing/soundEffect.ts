import { useReadVolume } from "@/lib/globalAtoms";
import { useUserAgent } from "@/utils/useUserAgent";
import { sound } from "@pixi/sound";
import { useEffect } from "react";
import { useUserTypingOptionsStateRef } from "../../atoms/stateAtoms";
sound.disableAutoPause = true;

const manifest = [
  { alias: "type", src: "/wav/key_type.wav" },
  { alias: "miss", src: "/wav/miss_type.wav" },
  { alias: "lineClear", src: "/wav/clear_type.wav" },
];

export const useSoundEffect = () => {
  const readTypingOptions = useUserTypingOptionsStateRef();
  const readVolume = useReadVolume();
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
      if (typingOptions.completedTypeSound) {
        clearTypeSoundPlay();
      } else if (typingOptions.typeSound) {
        typeSoundPlay();
      }
    } else {
      if (typingOptions.typeSound) {
        typeSoundPlay();
      }
    }
  };

  const triggerMissSound = () => {
    if (readTypingOptions().missSound) {
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
