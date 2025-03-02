import { useGlobalRefs } from "@/app/_components/global-provider/GlobalRefProvider";
import VolumeRange from "@/components/share-components/VolumeRange";
import { IS_ANDROID, IS_IOS } from "@/config/consts/globalConst";
import { Box, Flex } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import FilterInputs from "./child/FilterInputs";
import SearchInputs from "./child/SearchInputs";
import SortOptions from "./child/SortOptions";

const SearchContent = () => {
  const { playerRef } = useGlobalRefs();
  const { data: session } = useSession();

  return (
    <Flex as="section" width="100%" alignItems="center" mb={4}>
      <Box width="100%">
        <Box mb={3}>
          <SearchInputs />
        </Box>
        <Flex justifyContent={session?.user?.id ? "space-between" : "flex-end"}>
          {session?.user?.id && <FilterInputs />}
          {!IS_IOS && !IS_ANDROID && <VolumeRange playerRef={playerRef} />}
        </Flex>

        <Box mt={4}>
          <SortOptions />
        </Box>
      </Box>
    </Flex>
  );
};

export default SearchContent;
