import { useLinkClick } from "@/lib/global-hooks/useLinkClick";
import { ThemeColors } from "@/types";
import { Link } from "@chakra-ui/next-js";
import { useTheme } from "@chakra-ui/react";

interface UserLInkTextProps {
  userId: number;
  userName: string;
}

const UserLinkText = ({ userId, userName }: UserLInkTextProps) => {
  const theme: ThemeColors = useTheme();

  const handleLinkClick = useLinkClick();

  return (
    <Link href={`/user/${userId}`} onClick={handleLinkClick} color={theme.colors.secondary.main}>
      {userName}
    </Link>
  );
};

export default UserLinkText;
