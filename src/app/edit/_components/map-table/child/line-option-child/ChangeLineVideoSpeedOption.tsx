import { Button, Flex, Text } from "@chakra-ui/react";
import { Dispatch } from "react";

interface ChangeLineVideoSpeedOptionProps {
  changeVideoSpeed: number;
  setChangeVideoSpeed: Dispatch<number>;
}

const ChangeLineVideoSpeedOption = (props: ChangeLineVideoSpeedOptionProps) => {
  const { changeVideoSpeed, setChangeVideoSpeed } = props;

  const changeLabel = changeVideoSpeed < 0 ? "速度ダウン" : "速度アップ";

  const speedChange = ({ type }: { type: "up" | "down" }) => {
    if (type === "up") {
      if (changeVideoSpeed < 1.75) {
        setChangeVideoSpeed(changeVideoSpeed + 0.25);
      } else {
        setChangeVideoSpeed(1.75);
      }
    } else if (type === "down") {
      if (changeVideoSpeed > -1.75) {
        setChangeVideoSpeed(changeVideoSpeed - 0.25);
      } else {
        setChangeVideoSpeed(-1.75);
      }
    }
  };
  return (
    <Flex alignItems="baseline">
      <Button variant="unstyled" onClick={() => speedChange({ type: "down" })}>
        -
      </Button>
      <Text as="span">
        {changeVideoSpeed.toFixed(2)} {changeLabel}
      </Text>
      <Button variant="unstyled" onClick={() => speedChange({ type: "up" })}>
        +
      </Button>
    </Flex>
  );
};

export default ChangeLineVideoSpeedOption;
