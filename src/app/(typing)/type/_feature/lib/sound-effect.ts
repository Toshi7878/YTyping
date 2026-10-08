import type { sound as PixiSound } from "@pixi/sound";
import { useEffect } from "react";
import { getIsMobileDevice } from "@/store/user-agent";
import { getVolume } from "@/store/volume";
import { getTypingOptions } from "../tabs/setting/popover";

const manifest = [
  { alias: "type", src: "/wav/type.wav" },
  { alias: "typeCompleted", src: "/wav/type-completed.wav" },
  { alias: "miss", src: "/wav/miss.wav" },
] as const;

// @pixi/soundはimport時にwindow/documentへアクセスするためSSR中は読み込まず、クライアントでのみ動的importする
let sound: typeof PixiSound | null = null;

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
    void sound?.play(alias, { volume: 0 });
  });
};

export const useLoadSoundEffects = () => {
  useEffect(() => {
    let cancelled = false;

    void import("@pixi/sound").then((module) => {
      if (cancelled) return;
      const loaded = module.sound;
      loaded.disableAutoPause = true;

      manifest.forEach(({ alias, src }) => {
        if (!loaded.exists(alias)) {
          loaded.add(alias, { url: src, preload: true });
        }
      });
      sound = loaded;
    });

    return () => {
      cancelled = true;
    };
  }, []);
};

export const playSound = (alias: SoundAlias) => {
  const volume = getSoundVolume();
  void sound?.play(alias, { volume });
};

const getSoundVolume = () => {
  const isMobile = getIsMobileDevice();
  return (isMobile ? 100 : getVolume()) / 100;
};
