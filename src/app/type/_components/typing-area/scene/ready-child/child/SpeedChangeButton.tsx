import { usePlaySpeedReducer } from "@/app/type/atoms/speedReducerAtoms";
import { Box, Button, Text } from "@chakra-ui/react";

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
      colorScheme="cyan"
      ref={props.buttonRef}
      style={{ textDecoration: "none" }}
      onClick={() => dispatchSpeed({ type: props.type })}
      py={3}
      px={4}
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
