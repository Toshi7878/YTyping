import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  active: boolean;
  spinner?: boolean;
  text?: string;
  children: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({
  active,
  spinner = true,
  text,
  children,
  className,
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {active && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            {spinner && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
          </div>
        </div>
      )}
    </div>
  );
}