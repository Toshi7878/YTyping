"use client";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useClapMutationTimeline } from "@/utils/mutations/clap.mutations";
import { useSession } from "next-auth/react";
import { FaHandsClapping } from "react-icons/fa6";

interface ResultClapButtonProps {
  mapId: number;
  resultId: number;
  clapCount: number;
  hasClap: boolean;
}

function ResultClapButton({ mapId, resultId, clapCount, hasClap }: ResultClapButtonProps) {
  const { data: session } = useSession();

  const toggleClapMutation = useClapMutationTimeline({ mapId });

  const onClick = () => {
    if (!session) return;
    toggleClapMutation.mutate({ resultId, newState: !hasClap });
  };

  const isPending = toggleClapMutation.isPending;

  return (
    <div className="inline-flex">
      <TooltipWrapper disabled={!!session} label={"拍手はログイン後に可能です"}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!session || isPending}
          onClick={onClick}
          className={cn(
            "min-w-[100px] rounded-full border px-7",
            hasClap ? "bg-perfect/20 border-perfect text-perfect" : "",
            session && "hover:bg-perfect/20 hover:text-perfect",
          )}
        >
          <div className="flex items-center space-x-1 tracking-wider">
            <FaHandsClapping />
            <span>×{clapCount}</span>
          </div>
        </Button>
      </TooltipWrapper>
    </div>
  );
}

export default ResultClapButton;
