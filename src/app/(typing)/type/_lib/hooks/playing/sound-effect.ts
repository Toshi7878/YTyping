import { sound } from "@pixi/sound";
import { useEffect } from "react";
import { useReadVolume, useUserAgent } from "@/lib/global-atoms";
import { useUserTypingOptionsStateRef } from "../../atoms/state-atoms";

const manifest = [
  { alias: "type", src: "/wav/type.wav" },
  { alias: "miss", src: "/wav/miss.wav" },
  { alias: "lineClear", src: "/wav/completed-type.wav" },
];

export const useSoundEffect = () => {
  const readTypingOptions = useUserTypingOptionsStateRef();
  const readVolume = useReadVolume();
  const isMobile = useUserAgent()?.getDevice().type === "mobile";

  useEffect(() => {
    sound.disableAutoPause = true;

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
    void sound.play("lineClear", { volume });
  };

  const typeSoundPlay = () => {
    const volume = (isMobile ? 100 : readVolume()) / 100;
    void sound.play("type", { volume, start: 0.005 });
  };

  const missSoundPlay = () => {
    const volume = (isMobile ? 100 : readVolume()) / 100;
    void sound.play("miss", { volume });
  };

  const iosActiveSound = () => {
    void sound.play("lineClear", { volume: 0 });
    void sound.play("type", { volume: 0 });
    void sound.play("miss", { volume: 0 });
  };
  const triggerTypingSound = ({ isCompleted }: { isCompleted: boolean }) => {
    const typingOptions = readTypingOptions();

    if (isCompleted) {
      if (typingOptions.completedTypeSound) {
        clearTypeSoundPlay();
      } else if (typingOptions.typeSound) {
        typeSoundPlay();
      }
    } else if (typingOptions.typeSound) {
      typeSoundPlay();
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
