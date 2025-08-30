import { usePlaySpeedReducer } from "@/app/(typing)/type/_lib/atoms/speedReducerAtoms";
import { Button } from "@/components/ui/button";

interface SpeedChangeButtonProps {
  buttonRef: React.RefObject<HTMLButtonElement>;
  buttonLabel: {
    text: string;
    key: string;
  };
  type: "up" | "down";
}

const SpeedChangeButton = (props: SpeedChangeButtonProps) => {
  const dispatchSpeed = usePlaySpeedReducer();

  return (
    <Button
      variant="unstyled"
      ref={props.buttonRef}
      className="px-4 py-3 text-cyan-500 hover:text-cyan-600"
      onClick={() => dispatchSpeed({ type: props.type })}
    >
      <div className="relative top-1 text-3xl md:text-2xl">
        {props.buttonLabel.text}
        <small className="absolute -top-[0.9em] left-1/2 -translate-x-1/2 text-[65%]">{props.buttonLabel.key}</small>
      </div>
    </Button>
  );
};

export default SpeedChangeButton;
