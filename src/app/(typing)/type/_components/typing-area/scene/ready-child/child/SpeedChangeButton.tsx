import { usePlaySpeedReducer } from "@/app/(typing)/type/atoms/speedReducerAtoms";
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
      <div className="relative text-3xl md:text-2xl top-1">
        {props.buttonLabel.text}
        <small className="f-key">
          {props.buttonLabel.key}
        </small>
      </div>
    </Button>
  );
};

export default SpeedChangeButton;
