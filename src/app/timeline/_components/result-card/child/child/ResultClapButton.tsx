"use client";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { Button } from "@/components/ui/button";
import { INITIAL_STATE } from "@/config/consts/globalConst";
import { cn } from "@/lib/utils";
import { useLocalClapServerActions } from "@/utils/global-hooks/useLocalClapServerActions";
import { useSession } from "next-auth/react";
import { useActionState } from "react";
import { FaHandsClapping } from "react-icons/fa6";

interface ResultClapButtonProps {
  resultId?: number;
  clapCount?: number;
  hasClap?: boolean;
}

function ResultClapButton({ resultId = 0, clapCount = 0, hasClap = false }: ResultClapButtonProps) {
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
      <CustomToolTip placement="top" isDisabled={!!session} label={"拍手はログイン後に可能です"}>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={!session}
          className={cn(
            "mx-5 min-w-[100px] rounded-full border px-7 text-white",
            clapOptimisticState.hasClap ? "bg-yellow-500/20 text-yellow-500" : "bg-transparent text-white",
            session && "hover:bg-yellow-500/20 hover:text-yellow-500",
            !session && "cursor-default text-gray-400",
          )}
        >
          <div className="flex items-center space-x-1 tracking-wider">
            <FaHandsClapping />
            <span>×{clapOptimisticState.clapCount}</span>
          </div>
        </Button>
      </CustomToolTip>
    </form>
  );
}

export default ResultClapButton;
