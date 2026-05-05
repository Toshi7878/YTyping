"use client";
import { useSession } from "@/auth/client";
import { cn } from "@/lib/tailwind";
import { useToggleClapMutation } from "@/shared/result/clap";
import { HandsClappingButton } from "@/ui/icon-button";
import { TooltipWrapper } from "@/ui/tooltip";

interface ResultClapButtonProps {
  resultId: number;
  clapCount: number;
  hasClapped: boolean;
  className?: string;
}

export const ResultClapButton = ({ resultId, clapCount, hasClapped, className }: ResultClapButtonProps) => {
  const { data: session } = useSession();

  const toggleClapMutation = useToggleClapMutation();

  const onClick = () => {
    if (!session) return;
    toggleClapMutation.mutate({ resultId, newState: !hasClapped });
  };

  return (
    <TooltipWrapper disabled={!!session} label="拍手はログイン後に可能です">
      <HandsClappingButton
        label={`× ${clapCount}`}
        disabled={!session || toggleClapMutation.isPending}
        className={cn(
          "min-w-[100px] rounded-full border px-7",
          hasClapped && session ? "border-perfect bg-perfect/20 text-perfect" : "",
          session && "hover:bg-perfect/20 hover:text-perfect",
          className,
        )}
        onClick={onClick}
      />
    </TooltipWrapper>
  );
};
