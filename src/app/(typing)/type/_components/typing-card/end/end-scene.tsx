import { cn } from "@/lib/utils";
import { EndButtonContainer } from "./button-container";
import { ResultMessage } from "./result-message";

interface EndProps {
  className: string;
}

export const EndScene = ({ className }: EndProps) => {
  return (
    <div className={cn("flex flex-col justify-between", className)}>
      <ResultMessage />
      <EndButtonContainer />
    </div>
  );
};
