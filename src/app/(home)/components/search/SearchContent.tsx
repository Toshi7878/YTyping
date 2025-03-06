import { useGlobalRefs } from "@/app/_components/global-provider/GlobalRefProvider";
import VolumeRange from "@/components/share-components/VolumeRange";
import { IS_ANDROID, IS_IOS } from "@/config/consts/globalConst";
import { Box, Flex } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import FilterInputs from "./child/FilterInputs";
import SearchInputs from "./child/SearchInputs";
import SortOptions from "./child/SortOptions";
import SearchRange from "./child/child/SearchRange";

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
          <Flex alignItems="center" gap={5} direction={{ base: "column", md: "row" }}>
            {session?.user?.id && <FilterInputs />}
            <SearchRange step={0.1} mx={4} />
          </Flex>
          {!IS_IOS && !IS_ANDROID && <VolumeRange playerRef={playerRef} />}
        </Flex>
        <Box fontSize="xs" py="2">
          現在、譜面エディターの読み変換機能がエラーにより使用不可になっています。復旧までしばらくお待ちください。
        </Box>
        <Box mt={4}>
          <SortOptions />
        </Box>
      </Box>
    </Flex>
  );
};

export default SearchContent;
