import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/tailwind";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { SignInDropdownItems } from "./auth-dropdown-items";

export const SignInMenu = ({ className }: { className: string }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="unstyled"
          size="sm"
          className={cn("text-header-foreground/80 hover:text-header-foreground", className)}
        >
          ログイン
          <ChevronDown className="relative top-px size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <SignInDropdownItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
