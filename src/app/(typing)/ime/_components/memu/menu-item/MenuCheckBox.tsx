import { Image, ImageProps } from "@chakra-ui/next-js";
import { Box, Checkbox, Flex, useColorModeValue, VisuallyHidden } from "@chakra-ui/react";
import { ICON_SIZE } from "../MenuBar";

interface MenuCheckBoxProps {
  image: ImageProps["src"];
  imageAlt: string;
  value: boolean;
  onChange: (value: boolean) => void;
  title: string;
}

const MenuCheckBox = ({ image, imageAlt, value, onChange, title }: MenuCheckBoxProps) => {
  const bgColor = useColorModeValue("gray.100", "whiteAlpha.200");
  const hoverBgColor = useColorModeValue("gray.200", "whiteAlpha.300");

  return (
    <Box>
      <Flex
        as="label"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        p={2}
        borderRadius="md"
        bg={value ? bgColor : "transparent"}
        _hover={{ bg: hoverBgColor }}
        transition="all 0.2s"
        title={title}
      >
        <Image src={image} alt={imageAlt} width={ICON_SIZE} height={ICON_SIZE} />
        <VisuallyHidden>
          <Checkbox isChecked={value} onChange={(e) => onChange(e.target.checked)} />
        </VisuallyHidden>
      </Flex>
    </Box>
  );
};

export default MenuCheckBox;
