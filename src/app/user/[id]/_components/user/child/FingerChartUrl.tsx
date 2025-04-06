import { Link } from "@chakra-ui/next-js";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";

interface FingerChartUrlProps {
  url: string;
}

const FingerChartUrl = ({ url }: FingerChartUrlProps) => {
  if (!url) {
    return <Text>運指表はありません</Text>;
  }

  return (
    <Flex align="center" gap={2}>
      <Text fontWeight="medium">運指表:</Text>
      <Link
        href={url}
        isExternal
        color="blue.500"
        _hover={{ textDecoration: "underline", color: "blue.600" }}
        display="flex"
        alignItems="center"
      >
        <Text>運指表を見る</Text>
        <Icon as={FiExternalLink} ml={1} boxSize={4} />
      </Link>
    </Flex>
  );
};

export default FingerChartUrl;
