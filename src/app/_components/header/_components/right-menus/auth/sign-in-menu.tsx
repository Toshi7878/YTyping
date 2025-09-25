import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { SignInDropdownItems } from "./auth-dropdown-items";

export default function SignInMenu({ className }: { className: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="unstyled"
          size="sm"
          className={cn("hover:text-header-foreground text-header-foreground/80", className)}
        >
          ログイン
          <ChevronDown className="relative top-[1px] size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <SignInDropdownItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
