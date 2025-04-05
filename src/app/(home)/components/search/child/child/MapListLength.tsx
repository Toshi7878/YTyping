import { useMapListLengthState } from "@/app/(home)/atoms/atoms";
import { Box, Text } from "@chakra-ui/react";

const MapListLength = () => {
  const mapListLength = useMapListLengthState();

  return (
    <Box
      visibility={mapListLength === 0 ? "hidden" : "visible"}
      px={3}
      py={1}
      borderRadius="md"
      bg="rgba(255, 255, 255, 0.05)"
      fontWeight="medium"
    >
      <Text>譜面数: {mapListLength}</Text>
    </Box>
  );
};

export default MapListLength;
