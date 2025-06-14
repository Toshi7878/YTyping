import { usePlaySpeedReducer } from "@/app/(typing)/type/atoms/speedReducerAtoms";
import { Box, Text } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";

interface SpeedCHangeButtonProps {
  buttonRef: React.RefObject<HTMLButtonElement>;
  buttonLabel: {
    text: string;
    key: string;
  };
  type: "up" | "down";
}

const SpeedChangeButton = (props: SpeedCHangeButtonProps) => {
  const dispatchSpeed = usePlaySpeedReducer();

  return (
    <Button
      variant="link"
      ref={props.buttonRef}
      className="text-cyan-500 hover:text-cyan-600 no-underline py-3 px-4"
      onClick={() => dispatchSpeed({ type: props.type })}
    >
      <Box position="relative" fontSize={{ base: "3rem", md: "3xl" }} top="4px">
        {props.buttonLabel.text}
        <Text as="small" className="f-key">
          {props.buttonLabel.key}
        </Text>
      </Box>
    </Button>
  );
};

export default SpeedChangeButton;
