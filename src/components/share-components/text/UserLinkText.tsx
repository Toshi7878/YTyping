import { ThemeColors } from "@/types";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
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
    <Link
      href={`/user/${userId}`}
      position="relative"
      zIndex={1}
      onClick={handleLinkClick}
      color={theme.colors.secondary.main}
    >
      {userName}
    </Link>
  );
};

export default UserLinkText;
