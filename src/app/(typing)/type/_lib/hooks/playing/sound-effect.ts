import { sound } from "@pixi/sound";
import { useEffect } from "react";
import { useReadVolume, useUserAgent } from "@/lib/global-atoms";
import { useReadUserTypingOptions } from "../../atoms/state-atoms";

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
  const readTypingOptions = useReadUserTypingOptions();
  const readVolume = useReadVolume();
  const isMobile = useUserAgent()?.getDevice().type === "mobile";

  useEffect(() => {
    sound.disableAutoPause = true;

    manifest.forEach(({ alias, src }) => {
      if (!sound.exists(alias)) {
        sound.add(alias, { url: src, preload: true });
      }
    });
  }, []);

  const getVolume = () => (isMobile ? 100 : readVolume()) / 100;

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
