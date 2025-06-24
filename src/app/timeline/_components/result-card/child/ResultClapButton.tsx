"use client";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { INITIAL_STATE } from "@/config/globalConst";
import { cn } from "@/lib/utils";
import { useLocalClapServerActions } from "@/utils/global-hooks/useLocalClapServerActions";
import { useSession } from "next-auth/react";
import { useActionState } from "react";
import { FaHandsClapping } from "react-icons/fa6";

interface ResultClapButtonProps {
  resultId: number;
  clapCount: number;
  hasClap: boolean;
}

function ResultClapButton({ resultId, clapCount, hasClap }: ResultClapButtonProps) {
  const { data: session } = useSession();

  const { clapOptimisticState, toggleClapAction } = useLocalClapServerActions({
    hasClap,
    clapCount,
  });

  const [state, formAction] = useActionState(async () => {
    const result = await toggleClapAction(resultId);

    return result;
  }, INITIAL_STATE);

  return (
    <form action={session ? formAction : () => {}} className="inline-flex">
      <TooltipWrapper disabled={!!session} label={"拍手はログイン後に可能です"}>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={!session}
          className={cn(
            "min-w-[100px] rounded-full border px-7",
            clapOptimisticState.hasClap ? "bg-perfect/20 border-perfect text-perfect" : "",
            session && "hover:bg-perfect/20 hover:text-perfect",
          )}
        >
          <div className="flex items-center space-x-1 tracking-wider">
            <FaHandsClapping />
            <span>×{clapOptimisticState.clapCount}</span>
          </div>
        </Button>
      </TooltipWrapper>
    </form>
  );
}

export default ResultClapButton;
