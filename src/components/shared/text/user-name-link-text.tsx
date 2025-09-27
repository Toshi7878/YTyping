import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserNameLinkTextProps {
  userId: number;
  userName: string | null;
  className?: string;
}

const UserNameLinkText = ({ userId, userName, className }: UserNameLinkTextProps) => {
  if (!userName) return null;

  return (
    <Link href={`/user/${userId}`} className={cn("text-secondary relative z-1 hover:underline", className)}>
      {userName}
    </Link>
  );
};

export default UserNameLinkText;
