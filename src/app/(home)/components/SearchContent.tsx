import { useGlobalRefs } from "@/app/_components/global-provider/GlobalRefProvider";
import VolumeRange from "@/components/custom-ui/VolumeRange";
import { Box, Flex } from "@chakra-ui/react";
import SearchInputs from "./search/SearchInputs";

const SearchContent = () => {
  const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
  const { playerRef } = useGlobalRefs();

  return (
    <Flex as="section" width="100%" alignItems="center" mb={4}>
      <Box width="100%">
        <Box mb={3}>
          <SearchInputs />
        </Box>
        {!isIOS && !isAndroid && (
          <Flex justifyContent="flex-end">
            <VolumeRange playerRef={playerRef} />
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default SearchContent;
