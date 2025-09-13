import { cn } from "@/lib/utils";
import Link from "next/link";

interface UserLInkTextProps {
  userId: number;
  userName: string | null;
  className?: string;
}

const UserLinkText = ({ userId, userName, className }: UserLInkTextProps) => {
  if (!userName) return null;

  return (
    <Link href={`/user/${userId}`} className={cn("text-secondary relative z-1 hover:underline", className)}>
      {userName}
    </Link>
  );
};

export default UserLinkText;
