import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import SearchCard from "./child/SearchModal";
import SearchInputs from "./child/SearchInputs";
import { useGlobalRefs } from "@/components/globalRefContext/GlobalRefProvider";
import VolumeRange from "@/components/custom-ui/VolumeRange";

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
        <Flex justifyContent="space-between">
          <SearchCard />
          {!isIOS && !isAndroid && (
            <Flex justifyContent="flex-end">
              <VolumeRange playerRef={playerRef} />
            </Flex>
          )}
        </Flex>
      </Box>
    </Flex>
  );
};

export default SearchContent;
