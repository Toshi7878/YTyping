import { useVideoSpeedChange } from "@/app/type/hooks/useVideoSpeedChange";
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
  const { defaultSpeedChange } = useVideoSpeedChange();

  return (
    <Box>
      <Button
        variant="link"
        colorScheme="cyan"
        ref={props.buttonRef}
        style={{ textDecoration: "none" }} // 下線非表示
        onClick={() => defaultSpeedChange(props.type)}
      >
        <Box position="relative" fontSize={{ base: "3rem", md: "3xl" }} top="4px">
          {props.buttonLabel.text}
          <Text as="small" className="f-key">
            {props.buttonLabel.key}
          </Text>
        </Box>
      </Button>
    </Box>
  );
};

export default SpeedChangeButton;
