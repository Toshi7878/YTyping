import { ThemeColors } from "@/types";
import { Card, CardProps, useTheme } from "@chakra-ui/react";

interface CustomMapCardProps extends CardProps {
  children: React.ReactNode;
}

const CustomMapCard = ({ children, ...rest }: CustomMapCardProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Card
      transition="box-shadow 0.3s"
      bg={theme.colors.background.card}
      _hover={{
        boxShadow: theme.colors.home.card.hover,
      }}
      {...rest}
    >
      {children}
    </Card>
  );
};

export default CustomMapCard;
