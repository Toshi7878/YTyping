"use client";
import { useSession } from "next-auth/react";
import { HandsClappingButton } from "@/components/ui/icon-button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useToggleClapMutation } from "@/lib/mutations/clap";
import { cn } from "@/lib/utils";

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
