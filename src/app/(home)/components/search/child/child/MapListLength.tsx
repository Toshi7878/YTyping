import { useMapListLengthQuery } from "@/util/global-hooks/query/useMapListQuery";
import { Flex, Spinner, Text } from "@chakra-ui/react";

const MapListLength = () => {
  const { data: mapListLength, isPending } = useMapListLengthQuery();

  return (
    <Flex
      visibility={mapListLength === 0 ? "hidden" : "visible"}
      px={3}
      py={1}
      borderRadius="md"
      bg="rgba(255, 255, 255, 0.05)"
      fontWeight="medium"
      gap={2}
    >
      <Text>譜面数:</Text>
      <Flex minWidth="1.75rem" width="1.75rem" alignItems="center" justifyContent="end">
        {isPending ? <Spinner size="sm" /> : mapListLength}
      </Flex>
    </Flex>
  );
};

export default MapListLength;
