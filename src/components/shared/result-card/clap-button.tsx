"use client";
import { useSession } from "next-auth/react";
import { FaHandsClapping } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useClapMutationTimeline } from "@/lib/mutations/clap";
import { cn } from "@/lib/utils";

interface ResultClapButtonProps {
  resultId: number;
  clapCount: number;
  hasClapped: boolean;
  className?: string;
}

export const ResultClapButton = ({ resultId, clapCount, hasClapped, className }: ResultClapButtonProps) => {
  const { data: session } = useSession();

  const toggleClapMutation = useClapMutationTimeline();

  const onClick = () => {
    if (!session) return;
    toggleClapMutation.mutate({ resultId, newState: !hasClapped });
  };

  return (
    <div className={cn("inline-flex", className)}>
      <TooltipWrapper disabled={!!session} label={"拍手はログイン後に可能です"}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!session || toggleClapMutation.isPending}
          onClick={onClick}
          className={cn(
            "min-w-[100px] rounded-full border px-7",
            hasClapped && session ? "bg-perfect/20 border-perfect text-perfect" : "",
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
};
