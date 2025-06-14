import { HAPPY_EMOJI } from "@/config/emoji";
import { memo, useCallback } from "react";

const RandomEmoji = () => {
  const getRandomEmoji = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * HAPPY_EMOJI.length);
    return HAPPY_EMOJI[randomIndex];
  }, []);

  return (
    <span className="font-sans">
      {getRandomEmoji()}
    </span>
  );
};

export default memo(RandomEmoji);
