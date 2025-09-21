import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-muted animate-pulse rounded-md", className)} {...props} />;
}

export { Skeleton };
