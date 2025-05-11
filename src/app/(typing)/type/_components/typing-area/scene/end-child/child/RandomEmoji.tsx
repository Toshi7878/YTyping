import { HAPPY_EMOJI } from "@/config/emoji";
import { Text } from "@chakra-ui/react";
import { memo, useCallback } from "react";

const RandomEmoji = () => {
  const getRandomEmoji = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * HAPPY_EMOJI.length);
    return HAPPY_EMOJI[randomIndex];
  }, []);

  return (
    <Text as="span" fontFamily="Roboto, sans-serif">
      {getRandomEmoji()}
    </Text>
  );
};

export default memo(RandomEmoji);
