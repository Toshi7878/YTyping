import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "@/components/ui/link";
import { loginMenuItem } from "@/config/headerNav";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { LogOutDropdownItem } from "./login/AuthDropdownItems";

interface UserMenuProps {
  userName: string;
  className: string;
}

export default function UserMenu({ userName, className }: UserMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="unstyled" size="sm" className={cn("hover:text-foreground", className)}>
          {userName}
          <ChevronDown className="relative top-[1px] size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-fit">
        {loginMenuItem.map((item, index) => (
          <DropdownMenuItem key={index} asChild>
            <Link href={item.href}>{item.title}</Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <LogOutDropdownItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
