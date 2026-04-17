import { sound } from "@pixi/sound";
import { useEffect } from "react";
import { getVolume } from "@/lib/atoms/global-atoms";
import { getIsMobileDevice } from "@/lib/atoms/user-agent";
import { getTypingOptions } from "../tabs/setting/popover";

const manifest = [
  { alias: "type", src: "/wav/type.wav" },
  { alias: "typeCompleted", src: "/wav/type-completed.wav" },
  { alias: "miss", src: "/wav/miss.wav" },
] as const;

type SoundAlias = (typeof manifest)[number]["alias"];

export const triggerTypeSound = () => {
  const typingOptions = getTypingOptions();

  if (typingOptions.typeSound) {
    playSound("type");
  }
};

export const triggerTypeCompletedSound = () => {
  const typingOptions = getTypingOptions();

  if (typingOptions.completedTypeSound) {
    playSound("typeCompleted");
  } else if (typingOptions.typeSound) {
    playSound("type");
  }
};

export const triggerMissSound = () => {
  if (getTypingOptions().missSound) {
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
  const volume = getSoundVolume();
  void sound.play(alias, { volume });
};

const getSoundVolume = () => {
  const isMobile = getIsMobileDevice();
  return (isMobile ? 100 : getVolume()) / 100;
};
