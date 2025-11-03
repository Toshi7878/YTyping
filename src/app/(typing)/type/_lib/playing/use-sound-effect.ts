import { sound } from "@pixi/sound";
import { useEffect } from "react";
import { readVolume } from "@/lib/atoms/global-atoms";
import { isMobileDevice } from "@/lib/atoms/user-agent";
import { readTypingOptions } from "../atoms/state";

const manifest = [
  { alias: "type", src: "/wav/type.wav" },
  { alias: "typeCompleted", src: "/wav/type-completed.wav" },
  { alias: "miss", src: "/wav/miss.wav" },
] as const;

type SoundAlias = (typeof manifest)[number]["alias"];

const START_OFFSETS: Partial<Record<SoundAlias, number>> = {
  type: 0.005,
};

export const useSoundEffect = () => {
  useEffect(() => {
    sound.disableAutoPause = true;

    manifest.forEach(({ alias, src }) => {
      if (!sound.exists(alias)) {
        sound.add(alias, { url: src, preload: true });
      }
    });
  }, []);

  const getVolume = () => {
    const isMobile = isMobileDevice();
    return (isMobile ? 100 : readVolume()) / 100;
  };

  const playSoundEffect = (alias: SoundAlias) => {
    const volume = getVolume();
    const start = START_OFFSETS[alias];
    void sound.play(alias, start != null ? { volume, start } : { volume });
  };

  const iosActiveSound = () => {
    manifest.forEach(({ alias }) => {
      void sound.play(alias, { volume: 0 });
    });
  };

  const triggerTypeSound = ({ isCompleted }: { isCompleted: boolean }) => {
    const typingOptions = readTypingOptions();

    if (isCompleted) {
      if (typingOptions.completedTypeSound) {
        playSoundEffect("typeCompleted");
      } else if (typingOptions.typeSound) {
        playSoundEffect("type");
      }
    } else if (typingOptions.typeSound) {
      playSoundEffect("type");
    }
  };

  const triggerMissSound = () => {
    if (readTypingOptions().missSound) {
      playSoundEffect("miss");
    }
  };

  return {
    iosActiveSound,
    triggerTypeSound,
    triggerMissSound,
    playSoundEffect,
  };
};
