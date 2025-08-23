import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { loginMenuItem } from "@/config/headerNav";
import { cn } from "@/lib/utils";
import { useRouter } from "@bprogress/next/app";
import { ChevronDown } from "lucide-react";
import { LogOutDropdownItem } from "./login/AuthDropdownItems";

interface UserMenuProps {
  userName: string;
  className: string;
}

export default function UserMenu({ userName, className }: UserMenuProps) {
  const router = useRouter();

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
          <DropdownMenuItem key={index} onSelect={() => router.push(item.href)}>
            {item.title}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <LogOutDropdownItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
