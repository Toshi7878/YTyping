import { Button } from "@/components/ui/button";
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
    <div className="flex items-baseline">
      <Button variant="ghost" size="sm" className="h-auto p-1" onClick={() => speedChange({ type: "down" })}>
        -
      </Button>
      <span className="mx-2">
        {changeVideoSpeed.toFixed(2)} {changeLabel}
      </span>
      <Button variant="ghost" size="sm" className="h-auto p-1" onClick={() => speedChange({ type: "up" })}>
        +
      </Button>
    </div>
  );
};

export default ChangeLineVideoSpeedOption;
