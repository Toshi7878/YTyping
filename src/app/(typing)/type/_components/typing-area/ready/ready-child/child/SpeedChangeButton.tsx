import { usePlaySpeedReducer } from "@/app/(typing)/type/_lib/atoms/speedReducerAtoms";
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
      className="px-4 py-3 text-cyan-500 no-underline hover:text-cyan-600"
      onClick={() => dispatchSpeed({ type: props.type })}
    >
      <div className="relative top-1 text-3xl md:text-2xl">
        {props.buttonLabel.text}
        <small className="f-key">{props.buttonLabel.key}</small>
      </div>
    </Button>
  );
};

export default SpeedChangeButton;
