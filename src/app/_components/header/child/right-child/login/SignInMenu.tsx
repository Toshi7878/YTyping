import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsDiscord, BsGoogle } from "react-icons/bs";
import SignInMenuItem from "./child/SignInMenuItem";

export default function SignInMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="link" size="sm" className="text-muted-foreground hover:text-foreground text-xs p-2">
          ログイン
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <SignInMenuItem
            className="hover:bg-[#7289DA] hover:text-white"
            text="Discordでログイン"
            leftIcon={<BsDiscord size="1.5em" />}
            provider="discord"
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <SignInMenuItem
            className="hover:bg-[#DB4437] hover:text-white"
            text="Googleでログイン"
            leftIcon={<BsGoogle size="1.5em" />}
            provider="google"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
