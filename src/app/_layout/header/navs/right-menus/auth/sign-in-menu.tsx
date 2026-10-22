import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { cn } from "@/utils/cn";
import { SignInDropdownItems } from "./auth-dropdown-items";

export const SignInMenu = ({ className }: { className: string }) => {
  const t = useTranslations("layout.auth");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="unstyled"
            size="sm"
            className={cn("text-header-foreground/80 hover:text-header-foreground", className)}
          >
            {t("signIn")}
            <ChevronDown className="relative top-px size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <SignInDropdownItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
