import { sound } from "@pixi/sound";
import { useEffect } from "react";
import { readVolume } from "@/lib/atoms/global-atoms";
import { readIsMobileDevice } from "@/lib/atoms/user-agent";
import { readTypingOptions } from "../atoms/hydrate";

const manifest = [
  { alias: "type", src: "/wav/type.wav" },
  { alias: "typeCompleted", src: "/wav/type-completed.wav" },
  { alias: "miss", src: "/wav/miss.wav" },
] as const;

type SoundAlias = (typeof manifest)[number]["alias"];

const START_OFFSETS: Partial<Record<SoundAlias, number>> = {
  type: 0.005,
};

export const triggerTypeSound = ({ isCompleted }: { isCompleted: boolean }) => {
  const typingOptions = readTypingOptions();

  if (isCompleted) {
    if (typingOptions.completedTypeSound) {
      playSound("typeCompleted");
    } else if (typingOptions.typeSound) {
      playSound("type");
    }
  } else if (typingOptions.typeSound) {
    playSound("type");
  }
};

export const triggerMissSound = () => {
  if (readTypingOptions().missSound) {
    playSound("miss");
  }
};

export const iosActiveSound = () => {
  manifest.forEach(({ alias }) => {
    void sound.play(alias, { volume: 0 });
  });
};

export const useLoadSoundEffects = () => {
  useEffect(() => {
    sound.disableAutoPause = true;

    manifest.forEach(({ alias, src }) => {
      if (!sound.exists(alias)) {
        sound.add(alias, { url: src, preload: true });
      }
    });
  }, []);
};

export const playSound = (alias: SoundAlias) => {
  const volume = getVolume();
  const start = START_OFFSETS[alias];
  void sound.play(alias, start != null ? { volume, start } : { volume });
};

const getVolume = () => {
  const isMobile = readIsMobileDevice();
  return (isMobile ? 100 : readVolume()) / 100;
};
