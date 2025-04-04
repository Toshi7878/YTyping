import { ThemeColors } from "@/types";
import { useLinkClick } from "@/util/global-hooks/useLinkClick";
import { Link } from "@chakra-ui/next-js";
import { Button, useTheme } from "@chakra-ui/react";
import { useParams } from "next/navigation";

const TypeLinkButton = () => {
  const theme: ThemeColors = useTheme();
  const { id } = useParams();
  const handleLinkClick = useLinkClick();
  return (
    <Link href={`/type/${id}`} onClick={handleLinkClick}>
      <Button
        size="md"
        variant="outline"
        color={theme.colors.text.body}
        borderColor={theme.colors.border.card}
        _hover={{
          bg: theme.colors.button.sub.hover,
        }}
      >
        タイピングページに移動
      </Button>
    </Link>
  );
};

export default TypeLinkButton;
