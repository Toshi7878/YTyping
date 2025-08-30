import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { SignInDropdownItems } from "./AuthDropdownItems";

export default function SignInMenu({ className }: { className: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="unstyled" size="sm" className={cn("hover:text-foreground", className)}>
          <span>ログイン</span>
          <ChevronDown className="relative top-[1px] size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <SignInDropdownItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
