import { ThemeColors } from "@/types";
import { SimpleGrid, SimpleGridProps, useTheme } from "@chakra-ui/react";

interface CustomSimpleGridProps extends SimpleGridProps {
  children: React.ReactNode;
}

const CustomSimpleGrid = ({ children, ...rest }: CustomSimpleGridProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <SimpleGrid
      variant={"filled"}
      bg={theme.colors.background.card}
      color={theme.colors.text.body}
      boxShadow="lg"
      {...rest}
    >
      {children}
    </SimpleGrid>
  );
};

export default CustomSimpleGrid;
