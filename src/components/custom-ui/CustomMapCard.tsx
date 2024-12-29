import { ThemeColors } from "@/types";
import { Card, useTheme } from "@chakra-ui/react";

interface CustomMapCardProps {
  children: React.ReactNode;
}

const CustomMapCard = ({ children }: CustomMapCardProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Card
      transition="box-shadow 0.3s"
      bg={theme.colors.background.card}
      _hover={{
        boxShadow: theme.colors.home.card.hover,
      }}
    >
      {children}
    </Card>
  );
};

export default CustomMapCard;
